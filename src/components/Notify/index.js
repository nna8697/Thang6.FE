import { Button, Dropdown } from "antd";
import { BellOutlined } from "@ant-design/icons";
import "./Notify.css";
function Notify() {
    const items = [
        {
            label: <div className="notify_item">
                <div className="notify_item-icon">
                    <BellOutlined></BellOutlined>
                </div>
                <div className="notify_item-content">
                    <div className="notify_item-title">Title</div>
                    <div className="notify_item-time">8 phút trước</div>
                </div>
            </div>,
            key: '1',
        },
        {
            label: "Item 2",
            key: '2',
        },
        {
            label: "Item 3",
            key: '3',
        },
        {
            label: "Item 4",
            key: '4',
        },
        {
            label: "Item 5",
            key: '5',
        },
        {
            label: "Item 6",
            key: '6',
        },
        {
            label: "Item 7",
            key: '7',
        },
        {
            label: "Item 8",
            key: '8',
        },
    ];
    return (
        <>
            <Dropdown menu={{ items }} trigger={['click']} dropdownRender={
                (menu) => {
                    return (
                        <>
                            <div className="notify__dropdown">
                                <div className="notify__header">
                                    <div className="notify__header-title">
                                        <BellOutlined></BellOutlined>  Notifications

                                    </div>
                                    <Button type="link">View All</Button>
                                </div>
                                <div className="notify__body">
                                    {menu}
                                </div>
                            </div>
                        </>
                    );
                }
            }>
                <Button type="text" icon={<BellOutlined />}>

                </Button>
            </Dropdown>
        </>
    );
}

export default Notify;