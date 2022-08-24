import { useDidCancel } from '@elune/shared';
import { SyncOutlined } from '@ant-design/icons';
import { Empty, Select, Spin, Tooltip } from 'antd';
import {
    forwardRef,
    ForwardRefRenderFunction,
    memo,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { CommonFormSelectProps, OptionsTypes } from '../../interface/types';
export interface CommonSelectRef {
    onRefresh: () => void;
    onDependsValuesChange: (values: any[]) => void;
}
const CommonSelect: ForwardRefRenderFunction<CommonSelectRef, CommonFormSelectProps> = (
    {
        options,
        initList = true,
        showRefresh,
        canFilter = true,
        disSearchRefresh,
        refreshClean,
        showDescription,
        render,
        renderText,
        searchFun,
        // onBackChangeFrom,
        onOptionsChange,
        onRefreshHandler,
        value,
        showMore,
        ...other
    },
    ref,
) => {
    const [didCancel] = useDidCancel();
    // 设置loading
    const [fetching, setFetching] = useState(false);
    // options列表
    const [list, setList] = useState<OptionsTypes[]>([]);
    const searchRealFun = useRef(searchFun);
    const dependsValues = useRef<unknown[]>([]);
    const currentValue = useRef(value);
    const otherInfo = useRef(other);
    const searchQuery = useRef('');
    currentValue.current = value;
    otherInfo.current = other;
    // 远程搜索方法
    const onSearch = useCallback(async (value: string) => {
        searchQuery.current = value;
        if (searchRealFun.current) {
            setFetching(true);
            setList(await searchRealFun.current(value, dependsValues.current));
            setFetching(false);
        }
    }, []);
    useEffect(() => {
        onOptionsChange?.(list);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [list]);
    // 第一次初始化远程搜索内容防止空白
    useEffect(() => {
        if (!initList) return;
        if (searchRealFun.current) {
            setFetching(true);
            searchRealFun.current('', dependsValues.current).then((v) => {
                if (!didCancel.current) {
                    setList(v);
                    setFetching(false);
                }
            });
        }
    }, [didCancel, initList]);
    const onRefresh = useCallback(async () => {
        if (didCancel.current) return;
        onRefreshHandler?.();
        await onSearch('');
        if (refreshClean) {
            other.onChange?.(undefined, []);
        }
    }, [onSearch, onRefreshHandler, other, refreshClean, didCancel]);

    useImperativeHandle(
        ref,
        () => ({
            onRefresh,
            onDependsValuesChange: (values) => {
                dependsValues.current = values;
                onSearch(searchQuery.current);
            },
        }),

        [onRefresh, onSearch],
    );
    const data = useMemo(() => {
        if (
            other.mode === 'multiple' &&
            other.maxCount &&
            value &&
            value.length >= other.maxCount
        ) {
            const optionsList = (options || list).map((i) => {
                return {
                    ...i,
                    disabled: !value.includes(i.value),
                };
            });
            return optionsList;
        }
        return options || list;
    }, [other.mode, other.maxCount, options, list, value]);

    const content = (
        <div className="row_center" style={{ ...other.style }}>
            <Select
                allowClear
                showSearch
                value={fetching ? undefined : value}
                loading={fetching}
                notFoundContent={
                    fetching ? <Spin /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }
                filterOption={
                    canFilter || other.mode === 'multiple'
                        ? (input, option) => {
                            return (
                                ((option?.label || option?.value) as string)
                                    ?.toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                            );
                        }
                        : false
                }
                // onSelect={(e: string) => {
                //   if (valueKey && onBackChangeFrom) {
                //     const option = (options || list).find((v) => v.value === e);
                //     onBackChangeFrom(
                //       {
                //         [valueKey]: option?.label,
                //       },
                //       option,
                //     );
                //   }
                // }}
                style={{ width: '100%' }}
                {...other}
                optionLabelProp="label"
                onSearch={disSearchRefresh ? undefined : onSearch}
            >
                {data.map(
                    (
                        { value, label, disabled, description, ...others }: OptionsTypes,
                        index: number,
                    ) => (
                        <Select.Option
                            key={value}
                            value={value}
                            disabled={disabled}
                            label={renderText ? renderText(label) : label}
                            {...others}
                        >
                            {showDescription ? (
                                <Tooltip className="row" title={`${label} | ${description}`}>
                                    {label}
                                    <span style={{ color: '#9999' }} className="mL-5">
                    | {description}
                  </span>
                                </Tooltip>
                            ) : render ? (
                                render((options || list)[index])
                            ) : (
                                label
                            )}
                        </Select.Option>
                    ),
                )}
            </Select>
            {showRefresh && <SyncOutlined className="mL-10" onClick={onRefresh} />}
        </div>
    );
    const item = (options || list).find((i) => i.value === value);
    if (showMore && item) {
        const title =
            showMore === 'label'
                ? item.label
                : typeof showMore === 'function'
                    ? showMore(item)
                    : item.value;
        return <Tooltip title={`${title}`}>{content}</Tooltip>;
    }
    return content;
};
export default memo(forwardRef(CommonSelect));
