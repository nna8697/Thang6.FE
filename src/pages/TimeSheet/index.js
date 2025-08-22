import React, { useEffect, useState } from "react";
import { Table, DatePicker, Button, message, Card, Typography } from "antd";
import dayjs from "dayjs";
import { getCookie } from '../../helpers/cookies';
import { LoginOutlined, LogoutOutlined, ClockCircleOutlined } from '@ant-design/icons';
import './workSession.scss';
import { API_DOMAIN } from '../../config';

const { Text } = Typography;

const TimeSheet = () => {
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [columns, setColumns] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const today = dayjs().format("YYYY-MM-DD");
    const isCurrentMonth = selectedMonth.isSame(dayjs(), 'month');

    const userId = getCookie('id');
    const fullname = getCookie('fullname');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [employeesRes, attendanceRes] = await Promise.all([
                fetch(`${API_DOMAIN}/api/users/employees`),
                fetch(`${API_DOMAIN}/api/attendance/month?month=${selectedMonth.month() + 1}&year=${selectedMonth.year()}`)
            ]);

            const employeesJson = await employeesRes.json();
            const attendanceJson = await attendanceRes.json();

            const attendanceData = attendanceJson.data || attendanceJson;
            const employeesData = employeesJson.data || employeesJson;

            setAttendanceData(Array.isArray(attendanceData) ? attendanceData : []);
            setEmployees(Array.isArray(employeesData) ? employeesData : []);

            const todayData = attendanceData.find(item =>
                item.employeeId.toString() === userId.toString() &&
                dayjs(item.date).format("YYYY-MM-DD") === today
            );

            const checkinTimes = todayData?.checkin?.split(',') || [];
            const checkoutTimes = todayData?.checkout?.split(',') || [];
            const hoursWorked = todayData?.hours?.split(',') || [];

            setTodayStatus({
                checkinTimes,
                checkoutTimes,
                hoursWorked,
                lastAction: checkinTimes.length > checkoutTimes.length ? 'checkin' : 'checkout'
            });
        } catch (err) {
            message.error("Lỗi khi tải dữ liệu");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    useEffect(() => {
        const daysInMonth = selectedMonth.daysInMonth();
        const dynamicColumns = [];

        for (let i = 1; i <= daysInMonth; i++) {
            const day = selectedMonth.date(i).format("YYYY-MM-DD");
            dynamicColumns.push({
                title: i,
                dataIndex: ["workLogs", day],
                render: (_, row) => {
                    const log = row.workLogs?.[day];
                    let totalMinutes = 0;
                    if (log?.hours) {
                        totalMinutes = log.hours
                            .split(',')
                            .map(str => Math.round(parseFloat(str) * 60))
                            .reduce((sum, m) => sum + (isNaN(m) ? 0 : m), 0);
                    }
                    return (
                        <div style={{ textAlign: "center" }}>
                            {totalMinutes > 0 ? formatHoursShort(totalMinutes / 60) : "-"}
                        </div>
                    );
                },
                align: "center",
                width: 60,
            });
        }

        setColumns([
            {
                title: "Nhân viên",
                dataIndex: "fullname",
                fixed: "left",
                width: 150,
                render: (text) => <Text ellipsis={{ tooltip: text }}>{text}</Text>
            },
            ...dynamicColumns,
        ]);
    }, [selectedMonth, attendanceData]);

    const getMergedData = () => {
        const groupedAttendance = {};

        if (!Array.isArray(attendanceData)) {
            return [];
        }

        attendanceData.forEach((item) => {
            const dateStr = dayjs(item.date).format("YYYY-MM-DD");
            if (!groupedAttendance[item.employeeId]) {
                groupedAttendance[item.employeeId] = {};
            }
            groupedAttendance[item.employeeId][dateStr] = {
                hours: item.hours
            };
        });

        const safeEmployees = Array.isArray(employees) ? employees : [];
        return safeEmployees.map((emp) => ({
            employeeId: emp.employeeId,
            fullname: emp.fullname,
            workLogs: groupedAttendance[emp.employeeId] || {}
        }));
    };

    const handleCheckIn = async () => {
        try {
            const response = await fetch(`${API_DOMAIN}/api/attendance/checkin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: userId, fullname })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Check-in thất bại");
            }

            message.success(data.message || "Check-in thành công");
            await fetchData();
        } catch (err) {
            message.error(err.message || "Lỗi khi check-in");
        }
    };

    const handleCheckOut = async () => {
        try {
            const response = await fetch(`${API_DOMAIN}/api/attendance/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ employeeId: userId })
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Check-out thất bại");
            }

            message.success(data.message || "Check-out thành công");
            await fetchData();
        } catch (err) {
            message.error(err.message || "Lỗi khi check-out");
        }
    };

    const formatHoursToText = (decimalHours) => {
        const totalMinutes = Math.round(decimalHours * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours} tiếng${minutes > 0 ? ` ${minutes} phút` : ''}`;
    };

    const formatHoursShort = (decimalHours) => {
        const totalMinutes = Math.round(decimalHours * 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${hours}h${minutes > 0 ? `${minutes}p` : ''}`;
    };

    const renderStatusText = () => {
        if (loading) return <div className="status-message loading">Đang tải dữ liệu...</div>;
        if (!todayStatus || !Array.isArray(todayStatus.checkinTimes)) {
            return <div className="status-message error">Không thể tải trạng thái</div>;
        }

        if (todayStatus.checkinTimes.length === 0) {
            return (
                <div className="status-message empty">
                    {isCurrentMonth ? "Chưa checkin hôm nay" : "Đang xem tháng khác - không thể hiển thị trạng thái hôm nay"}
                </div>
            );
        }

        return (
            <div className="work-sessions">
                {todayStatus.checkinTimes.map((checkinTime, index) => {
                    const checkoutTime = todayStatus.checkoutTimes?.[index] || 'Đang làm việc';
                    const hours = todayStatus.hoursWorked?.[index] || '0';
                    const isCurrentSession = index === todayStatus.checkinTimes.length - 1 && !todayStatus.checkoutTimes?.[index];

                    return (
                        <div key={index} className={`session-card ${isCurrentSession ? 'current-session' : ''}`}>
                            <div className="session-title">
                                <span className="session-badge">{index + 1}</span>
                                Ca làm việc {index + 1}
                            </div>
                            <div className="session-detail checkin">
                                <ClockCircleOutlined className="detail-icon" />
                                <span>Vào lúc: {checkinTime}</span>
                            </div>
                            <div className="session-detail checkout">
                                <ClockCircleOutlined className="detail-icon" />
                                <span>Ra lúc: {checkoutTime}</span>
                            </div>
                            <div className="session-detail hours">
                                <ClockCircleOutlined className="detail-icon" />
                                <span>Tổng giờ: {formatHoursToText(Number(hours))}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="time-sheet-container">
            <Card title="Chấm công hôm nay" bordered={false} className="today-attendance-card">
                {!isCurrentMonth && (
                    <div className="notice-warning" style={{ marginBottom: '16px' }}>
                        <Text type="danger">⚠️ Bạn đang xem tháng khác. Không thể check-in/check-out.</Text>
                    </div>
                )}
                <div className="checkinout-actions">
                    <Button
                        className="checkin-btn"
                        type="primary"
                        onClick={handleCheckIn}
                        icon={<LoginOutlined />}
                        disabled={
                            !isCurrentMonth ||
                            (todayStatus?.checkinTimes?.length || 0) > (todayStatus?.checkoutTimes?.length || 0)
                        }
                        loading={loading}
                    >
                        Check-in
                    </Button>
                    <Button
                        className="checkout-btn"
                        type="primary"
                        onClick={handleCheckOut}
                        icon={<LogoutOutlined />}
                        disabled={
                            !isCurrentMonth ||
                            !(todayStatus?.checkinTimes?.length > todayStatus?.checkoutTimes?.length)
                        }
                        loading={loading}
                    >
                        Check-out
                    </Button>
                </div>
                {renderStatusText()}
            </Card>

            <div className="month-picker">
                <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    allowClear={false}
                    disabledDate={(current) => current && current > dayjs().endOf('day')}
                />
            </div>

            <Table
                className="attendance-table"
                columns={columns}
                dataSource={getMergedData()}
                rowKey="employeeId"
                scroll={{ x: 'max-content' }}
                loading={loading}
                bordered
                pagination={{
                    pageSize: 15,
                    showSizeChanger: false,
                    hideOnSinglePage: true
                }}
                size="middle"
            />
        </div>
    );
};

export default TimeSheet;
