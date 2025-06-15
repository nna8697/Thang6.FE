import React, { useEffect, useState } from 'react';
import { Table, DatePicker, InputNumber, Button, message } from 'antd';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { getCookie } from '../../helpers/cookies';
import './Timekeeping.scss';
import { createTimekeeping, getTimekeepingByMonth } from '../../services/timekeepingService';

const { MonthPicker } = DatePicker;

const Timekeeping = () => {
    const [data, setData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [loading, setLoading] = useState(false);

    const currentUserId = getCookie('id');
    const fullname = getCookie('fullname');
    const role = getCookie('role'); // admin, user
    const token = getCookie('token');

    const fetchData = async (month, year) => {
        setLoading(true);
        try {
            const { users, timekeeping } = await getTimekeepingByMonth(month, year);

            const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();
            const today = dayjs().format('YYYY-MM-DD');

            // Tạo dataSource với thông tin timekeeping
            const dataSource = users.map((user) => {
                const userTimekeeping = timekeeping.filter((tk) => tk.user_id === user.employeeId);
                const row = {
                    key: user.employeeId,
                    userId: user.employeeId,
                    fullname: user.fullname,
                    timekeepingData: {}
                };

                // Khởi tạo tất cả ngày trong tháng
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');
                    row[dateStr] = undefined;
                    row.timekeepingData[dateStr] = {};
                }

                // Cập nhật dữ liệu từ server
                userTimekeeping.forEach((tk) => {
                    const dateStr = dayjs(tk.work_date).format('YYYY-MM-DD');
                    row[dateStr] = tk.hours_worked;
                    row.timekeepingData[dateStr] = {
                        hours_worked: tk.hours_worked,
                        created_by: tk.created_by,
                        created_by_name: tk.created_by_name,
                        created_at: tk.created_at,
                        updated_by: tk.updated_by,
                        updated_by_name: tk.updated_by_name,
                        updated_at: tk.updated_at
                    };
                });

                return row;
            });

            // Tạo columns
            const dynamicColumns = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dateStr = dayjs(`${year}-${month}-${day}`).format('YYYY-MM-DD');

                return {
                    title: (
                        <div className="date-header">
                            <div>{day}</div>
                            <div className="day-name">{dayjs(dateStr).format('ddd')}</div>
                        </div>
                    ),
                    dataIndex: dateStr,
                    width: 110,
                    render: (value, record) => {
                        const tkData = record.timekeepingData[dateStr] || {};
                        const isToday = dateStr === today;
                        const isAdmin = role === 'admin';
                        const canEdit = isAdmin || isToday;

                        return (
                            <div className="timekeeping-cell">
                                {canEdit ? (
                                    <InputNumber
                                        min={0}
                                        max={24}
                                        step={0.5}
                                        value={value}
                                        onChange={(val) => handleChange(val, record.userId, dateStr, record.fullname)}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    <div className="hours-display">{value ?? '-'}</div>
                                )}

                                {(tkData.created_by_name || tkData.updated_by_name) && role === 'admin' && (
                                    <div className="timekeeping-meta">
                                        <small>
                                            {tkData.updated_by_name
                                                ? `Sửa: ${tkData.updated_by_name} (${dayjs(tkData.updated_at).format('DD/MM HH:mm')})`
                                                : `Tạo: ${tkData.created_by_name} (${dayjs(tkData.created_at).format('DD/MM HH:mm')}`}
                                        </small>
                                    </div>
                                )}
                            </div>
                        );
                    }
                };
            });

            const baseColumns = [
                {
                    title: 'Nhân viên',
                    dataIndex: 'fullname',
                    fixed: 'left',
                    width: 150,
                    render: (text, record) => (
                        <div>
                            <div className="employee-name">{text}</div>
                            {role === 'admin' && (
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => showHistory(record.userId, text)}
                                >
                                    Xem lịch sử
                                </Button>
                            )}
                        </div>
                    )
                },
                ...dynamicColumns,
                {
                    title: 'Tổng',
                    fixed: 'right',
                    width: 80,
                    render: (_, record) => {
                        const total = Object.values(record.timekeepingData)
                            .reduce((sum, tk) => sum + (tk.hours_worked || 0), 0);
                        return <div className="total-hours">{total.toFixed(1)}</div>;
                    }
                }
            ];

            setColumns(baseColumns);
            setData(dataSource);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu:', error);
            message.error('Không thể tải dữ liệu chấm công.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = async (value, targetUserId, workDate, targetFullname) => {
        try {
            // Lấy thông tin người đang thao tác từ cookie
            const currentUserId = getCookie('id');
            const currentUserFullname = getCookie('fullname');

            // Hiển thị dialog xác nhận
            const confirmResult = await Swal.fire({
                title: 'Xác nhận thay đổi',
                html: `Bạn <b>${currentUserFullname}</b> đang cập nhật giờ công cho <b>${targetFullname}</b><br>
                      Ngày ${dayjs(workDate).format('DD/MM/YYYY')} thành <b>${value} giờ</b>`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Xác nhận',
                cancelButtonText: 'Hủy bỏ',
                focusConfirm: false,
                allowOutsideClick: () => !Swal.isLoading()
            });

            if (confirmResult.isConfirmed) {
                // Gọi API cập nhật
                var obj = {
                    userId: targetUserId,       // ID nhân viên được chỉnh sửa
                    workDate,                  // Ngày làm việc
                    hoursWorked: value,        // Số giờ công
                    fullname: targetFullname, // Tên nhân viên
                    currentUserId             // ID người đang thao tác
                };

                const result = await createTimekeeping(obj);
                // Thông báo thành công
                await Swal.fire({
                    title: 'Thành công!',
                    text: result.message,
                    icon: 'success',
                    timer: 1500
                });

                // Làm mới dữ liệu
                fetchData(selectedMonth.month() + 1, selectedMonth.year());
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            Swal.fire({
                title: 'Lỗi!',
                text: error.message,
                icon: 'error'
            });
        }
    };

    const showHistory = (userId, employeeName) => {
        const userData = data.find(u => u.userId === userId);

        if (!userData) {
            return Swal.fire('Lỗi', 'Không tìm thấy dữ liệu nhân viên', 'error');
        }

        // Chuẩn bị dữ liệu lịch sử
        const history = Object.entries(userData.timekeepingData || {})
            .filter(([_, tk]) => tk.created_at)
            .sort((a, b) => new Date(b[0]) - new Date(a[0])) // Sắp xếp mới nhất trước
            .map(([date, tk]) => ({
                date: dayjs(date).format('DD/MM/YYYY'),
                hours: tk.hours_worked || 0,
                createdBy: tk.created_by_name || 'Hệ thống',
                createdAt: tk.created_at ? dayjs(tk.created_at).format('DD/MM HH:mm') : '-',
                updatedBy: tk.updated_by_name || '-',
                updatedAt: tk.updated_at ? dayjs(tk.updated_at).format('DD/MM HH:mm') : '-'
            }));

        // Tạo HTML để hiển thị
        const historyHtml = `
            <div class="history-container">
                <h4>Lịch sử chấm công: ${employeeName}</h4>
                ${history.length > 0 ? `
                    <table class="history-table">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                <th>Giờ công</th>
                                <th>Người tạo</th>
                                <th>Thời gian tạo</th>
                                <th>Người sửa</th>
                                <th>Thời gian sửa</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${history.map(item => `
                                <tr>
                                    <td>${item.date}</td>
                                    <td>${item.hours}</td>
                                    <td>${item.createdBy}</td>
                                    <td>${item.createdAt}</td>
                                    <td>${item.updatedBy}</td>
                                    <td>${item.updatedAt}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p>Không có lịch sử chấm công</p>'}
            </div>
        `;

        Swal.fire({
            title: 'Lịch sử chấm công',
            html: historyHtml,
            width: '90%',
            showConfirmButton: false,
            customClass: {
                popup: 'history-popup'
            },
            willOpen: () => {
                // Thêm style nếu cần
                const style = document.createElement('style');
                style.textContent = `
                    .history-container {
                        max-height: 70vh;
                        overflow-y: auto;
                    }
                    .history-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 10px;
                    }
                    .history-table th, .history-table td {
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }
                    .history-table th {
                        background-color: #f2f2f2;
                        position: sticky;
                        top: 0;
                    }
                    .history-table tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                `;
                document.head.appendChild(style);
            }
        });
    };

    const handleMonthChange = (date) => {
        if (!date) {
            setSelectedMonth(dayjs());
        } else {
            setSelectedMonth(date);
        }
    };

    useEffect(() => {
        if (selectedMonth) {
            fetchData(selectedMonth.month() + 1, selectedMonth.year());
        }
    }, [selectedMonth]);

    return (
        <div className="timekeeping-container">
            <div className="timekeeping-header">
                <h2>Bảng chấm công tháng {selectedMonth.format('MM/YYYY')}</h2>
                <MonthPicker
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    placeholder="Chọn tháng"
                    className="month-picker"
                    allowClear
                    format="MM/YYYY"
                />
            </div>

            <div className="table-wrapper">
                <Table
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    scroll={{ x: 'max-content', y: 'calc(100vh - 220px)' }}
                    bordered
                    pagination={false}
                    sticky
                />
            </div>
        </div>
    );
};

export default Timekeeping;