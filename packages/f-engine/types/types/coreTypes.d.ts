type Uuids = Array<string>;
type OptionModeType = 'select' | 'translate' | 'rotate' | 'scale';
type EventBusType = {
    renderPort: () => void;
    [key: string]: any;
};
export { Uuids, OptionModeType, EventBusType, };
