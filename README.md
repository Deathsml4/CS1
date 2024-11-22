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
| /bulk-delete | DELETE | Xóa nhiều link cùng lúc
| /getAllUrls  | GET |  Trả về tất cả các Urls
| /cache-status  | GET |  Trả về tất cả các Urls và trạng thái cache




## Công nghệ sử dụng

### Sử dụng `Sequelize` để tạo database và ORM.

SQLite 

Có thể dùng MySql server trong các trường hợp database lớn hơn

### Sử dụng `node-cache` để cache link.

node-cache là một in-memory data store, rất hữu ích cho việc caching các kết quả truy vấn Bằng cách sử dụng node-cache, bạn có thể giảm thiểu số lần truy vấn tới cơ sở dữ liệu cho những ID được yêu cầu thường xuyên.

### Sử dụng Load Balancing và Clustering

Nếu ứng dụng cần phục vụ nhiều người dùng đồng thời, việc sử dụng các kỹ thuật load balancing và clustering sẽ giúp phân phối tải đều hơn và tận dụng tối đa tài nguyên hệ thống.

Load balancing sẽ giúp phân phối các yêu cầu tới nhiều instance của ứng dụng. Bạn có thể sử dụng Nginx hoặc HAProxy để điều phối yêu cầu.

Clustering trong Node.js cho phép chạy nhiều instance của ứng dụng trên các CPU khác nhau.

**Cách áp dụng:**

- Trước khi truy vấn đến cơ sở dữ liệu, kiểm tra trong cache xem URL tương ứng đã được lưu trữ chưa.
- Nếu đã có trong cache, trả về URL mà không cần truy vấn đến cơ sở dữ liệu.
- Nếu không có, truy vấn cơ sở dữ liệu và lưu kết quả vào cache cho lần truy vấn tiếp theo.

### Sử dụng `express-rate-limit` để giới hạn số lượng request.

Để tránh quá tải hệ thống, bạn có thể áp dụng kỹ thuật rate limiting để giới hạn số lượng request mà một người dùng có thể thực hiện trong một khoảng thời gian nhất định.

Ví dụ, dùng thư viện `express-rate-limit` để giới hạn số request đến `/create` và `/bulk-create`, `/bulk-delete`.

**Lợi ích:**

- Bảo vệ hệ thống: Ngăn chặn DDoS và bảo vệ hệ thống khỏi những người dùng có hành vi bất thường.
- Tối ưu hiệu suất: Giảm tải hệ thống trong trường hợp có quá nhiều request.

## Tối Ưu 

**Cấu hình Cache:**

- Thêm TTL và chu kỳ kiểm tra để tự động xóa các mục cache cũ.
makeID():

- Cải thiện việc tạo ID bằng cách sử dụng Buffer và mã hóa base64, hiệu quả hơn so với vòng lặp ký tự.

**makeID():**

- Cải thiện việc tạo ID bằng cách sử dụng hash để tạo ra một ID duy nhất cho mỗi URL.

**findOrigin():**


- Cải thiện xử lý lỗi với các thông báo có ý nghĩa hơn.

**shortUrl():**

- Thêm cơ chế thử lại với tham số maxRetries.
- Cải thiện xử lý lỗi.
- Kiểm tra xung đột ID hiệu quả hơn.

**bulkCreate():**

- Thêm hỗ trợ thao tác hàng loạt để tạo nhiều URL cùng lúc.
- Bao gồm cập nhật cache cho các thao tác hàng loạt.
- Xử lý các mục trùng lặp với tùy chọn updateOnDuplicate

**bulkDelete():**

- Thêm hỗ trợ thao tác hàng loạt để xóa nhiều URL cùng lúc.
- Bao gồm cập nhật cache cho các thao tác hàng loạt.

**getAllUrls()**

- Thêm hỗ trợ thao tác hiển thị tất cả URL cùng lúc.

**cache-status**

- Thêm hỗ trợ thao tác hiển thị tất cả URL cùng lúc và trạng thái cache.

**Xử lý lỗi:**

- Thêm các thông báo lỗi cụ thể hơn.
- Bao gồm ghi log lỗi.
