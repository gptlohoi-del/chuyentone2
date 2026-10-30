# Chuyển Tone & Cảm Âm Nhạc Cụ

Ứng dụng web chuyển tone và nhập các nốt nhạc bằng bảng 21 nốt, dùng trên điện thoại hoặc máy tính. Giao diện tiếng Việt, không cần máy chủ để xử lý bản nhạc.

## Chức năng

- Chọn tone gốc và tone đích, hoặc tăng/giảm từng bán cung.
- Nhập nốt từ bảng 21 nốt (ba quãng thấp, trung, cao) hay bàn phím.
- Chuyển nốt, chỉnh quãng tám và tùy chọn hiển thị tên nốt Đô–Rê–Mi.
- Tô màu các nốt theo quan hệ cao độ; phát thử bằng Web Audio API.
- Sao chép kết quả hoặc **Tạo ảnh** PNG có tiêu đề, tone gốc/đích và nốt được tô màu.
- Xem hình vòng tròn hợp âm tham khảo.

## Cấu trúc repo

```text
chuyentone2/
├── index.html                 # Toàn bộ giao diện, xử lý nhạc, phát âm thanh
├── offline-image-export.js    # Tạo ảnh PNG offline bằng Canvas API
├── vongtron_hopam.jpg         # Ảnh tham khảo, lưu trong repo
├── README.md                  # Tài liệu này
└── .gitattributes
```

**Lưu ý:** Đưa đủ **cả ba file** `index.html`, `offline-image-export.js`, `vongtron_hopam.jpg` vào gói phát hành. Các đường dẫn dùng tương đối, cùng thư mục. Không đổi riêng tên một file nếu chưa cập nhật chỗ tham chiếu trong `index.html`.

## Chạy độc lập

1. Tải toàn bộ repo về máy và giải nén.
2. Mở `index.html` trong trình duyệt hiện đại (Chrome/Edge/Android WebView).
3. Chọn tone gốc, tone đích, nhập nốt và sử dụng.

Ứng dụng không tải mã JavaScript từ CDN, không dùng API máy chủ, không cần mạng để chuyển tone, phát âm thanh hoặc **tạo nội dung PNG**. Tính năng sao chép/tải file còn phụ thuộc quyền và cách trình duyệt/WebView xử lý tải xuống; một số Android WebView cần cơ chế lưu tệp từ ứng dụng chứa.

**Phân biệt:** Mở từ thư mục đã tải về có thể chạy offline. Nếu truy cập từ GitHub Pages hoặc một URL Internet thông thường, việc *mở lại URL khi mất mạng* không tự được bảo đảm; cần đóng gói file cục bộ hoặc có bộ nhớ đệm/service worker phù hợp.

## Tích hợp App Hub và sử dụng offline

1. Đưa toàn bộ các file trong repo lên GitHub, giữ nguyên tên và vị trí.
2. Trong **About → Topics** của repo, thêm nhãn `app-hub-module` (nếu App Hub của bạn được cấu hình để quét nhãn này).
3. Kiểm tra cấu hình/CI của **App Hub** có nhận diện repo này và **đóng gói đầy đủ các file `.html`, `.js`, `.jpg`** của module hay không. **Chỉ thêm nhãn Topic không tự tạo liên kết**, không bảo đảm ứng dụng đã được tải về máy.
4. Khi có Internet, phát hành và áp dụng bản cập nhật App Hub/OTA theo quy trình của App Hub hiện dùng.
5. Mở ứng dụng từ App Hub để xác nhận đã được tải/cài đặt. Sau đó tắt Wi-Fi/dữ liệu di động, khởi động lại App Hub và kiểm tra lại các chức năng.

Nếu App Hub đã lưu đầy đủ nội dung module trong máy, các tính năng xử lý nhạc và tạo PNG của repo này **không cần Internet**. Nếu App Hub chỉ liên kết đến GitHub Pages hoặc chưa tải các tệp tài nguyên thì không thể bảo đảm sử dụng offline. Việc thêm mới module bằng OTA thay vì cài lại APK cũng phụ thuộc vào phiên bản và cơ chế OTA của App Hub.

## Kiểm thử offline nhanh

- Bật mạng một lần để tải/áp dụng phiên bản App Hub chứa module.
- Bật chế độ máy bay, đóng rồi mở lại App Hub.
- Kiểm tra chọn tone, thêm nốt, chuyển tone, nghe âm, mở hình vòng tròn hợp âm.
- Nhập tên bài hát và bấm **Tạo ảnh**; kiểm tra máy có lưu/nhận được file `.png`.

## Thay đổi dành cho phiên bản này

- Loại bỏ thẻ tải `html2canvas` từ CDN.
- Thay chức năng tạo PNG bằng **Canvas API thuần JavaScript** nằm tại `offline-image-export.js`; không cần thư viện ngoài.
- Giữ các màu phân biệt nốt trên ảnh, tiêu đề và thông tin tone; xuống dòng khi nội dung dài.
- Bổ sung thông báo khi không xuất được ảnh, giới hạn kích thước để tránh dùng quá nhiều bộ nhớ điện thoại.

## Ghi chú kỹ thuật

- Không cần Node.js, npm, tài khoản người dùng hay backend để chạy module.
- Không bổ sung service worker hoặc sửa cấu hình OTA của App Hub trong repo này.
- Nếu đổi tên `offline-image-export.js`, hãy sửa thẻ `<script src="offline-image-export.js"></script>` trong phần `<head>` của `index.html`.
