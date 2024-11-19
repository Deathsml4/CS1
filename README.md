# CASE STUDY 1
Dưới đây là một chương trình đơn giản sử dụng `express.js`, có mục tiêu để rút gọn link. 

## Hướng dẫn cài đặt
```sh
# Cài đặt các gói liên quan
$ npm install
# Tạo folder cho database
$ mkdir db
# Khởi chạy ứng dụng
$ npm start
```

## Mô Tả
| Endpoint | Phương thức | Mục tiêu
|--|:--:|--|
| /short/:id | GET | Trả về đường dẫn gốc
| /create?url= | POST | Trả về ID được thu gọn
| /delete/:id | DELETE | Xóa link
| /bulk-create | POST | Tạo nhiều link với cùng một đường dẫn

## Công nghệ sử dụng
Sử dụng `Sequelize` để tạo database và ORM.
Sử dụng `node-cache` để cache link.
Sử dụng `express-rate-limit` để giới hạn số lượng request.
