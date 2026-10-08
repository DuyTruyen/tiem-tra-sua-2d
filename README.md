# Tiệm Trà Mơ · Dream Tea Shop

Bản chơi đầu tiên của game phục vụ quán trà Việt Nam, nhìn ngang. Nhân vật phải chạy sau quầy để nhận order, pha ly tại từng trạm và giao cho khách ở đúng ghế. Đây là game canvas Phaser, không phải bảng quản lý bằng các nút HTML.

## Chạy dự án

Cần Node.js 22.12+ hoặc 24 LTS và npm. Môi trường hiện tại đã có Node 24.

```sh
cd /workspace/tiem-tra-sua-2d
npm ci
npm run dev -- --port 5173
```

```sh
npm run build        # TypeScript và bản production
npm test             # Kiểm thử luật pha chế, order, chất lượng, kinh tế và lưu
npm run test:e2e     # Lượt chơi thật bằng Chromium; cần server dev đang chạy
```

Kiểm thử trình duyệt sử dụng `/usr/bin/chromium` sẵn có trong môi trường. Đặt `CHROMIUM_PATH` nếu máy khác dùng đường dẫn khác; đặt `GAME_URL` nếu đổi cổng. Không cần tải trình duyệt Playwright khi Chromium đã có sẵn. Ảnh kiểm tra được ghi vào `/tmp/tea-validation`.

## Chơi

- **A / D** hoặc **← / →**: đi ngang sau quầy. **Shift**: chạy.
- Đến ghế có khách, nhấn **E** để nhận order. Xem khẩu vị trên bubble hoặc sổ đơn góc phải.
- Đến **LY**, nhấn **E** để lấy ly M.
- Đến **TRÀ**, **giữ E** để rót, thả trong vùng xanh để đạt Perfect. Khi đang giữ E, nhấn **1** cho hồng trà hoặc **2** cho trà xanh.
- Đến **HƯƠNG VỊ**, nhấn E rồi chọn **1 sữa / 2 đào / 3 tắc**.
- Đến **TOPPING**, nhấn E rồi chọn **1 trân châu / 2 thạch / 3 pudding / 4 không topping**.
- Đến **ĐƯỜNG & ĐÁ**, nhấn E; chọn đường bằng **1–5**, rồi đá bằng **1–4**. Tham chiếu tỷ lệ ngay trong menu tại trạm.
- Đến **ĐÓNG NẮP**, nhấn E rồi chờ máy chạy xong. Đi xa trạm sẽ hủy thao tác.
- Mang ly về đúng ghế, nhấn **E** để giao. Khẩu vị sai được chấm điểm thấp, không tự sửa.
- **Q**: bỏ ly đang cầm (có chi phí hao hụt). **1 / 2 / 3**: đổi ly sau nâng cấp khay.
- **Tab**: xem thêm thời gian order. **Esc** hoặc nút Tạm dừng: dừng cả khách và đồng hồ.
- Trên thiết bị cảm ứng có nút di chuyển, chạy và tương tác; menu nguyên liệu có thể chạm để chọn. Chơi ngang màn hình cho không gian rộng hơn.

Công thức: **Trà sữa = hồng trà + sữa**; **Trà đào = hồng trà + siro đào**; **Trà tắc = trà xanh + nước tắc**. Topping, đường và đá tùy từng khách.

Ly đầu tiên có hướng dẫn trong cảnh và thời gian chờ rộng hơn. Sau đó khách bắt đầu tới liên tục. Ca làm kéo dài **5 phút**, từ 17:00 đến 22:00. Khách chờ quá lâu sẽ bỏ đi, giảm đánh giá. Không tự nhận order, tự pha hay tự giao món.

Cuối ca có báo cáo doanh thu, thưởng, nguyên liệu, mặt bằng, điện nước và lợi nhuận. Có thể mua khay 2–3 ly hoặc tăng tốc di chuyển rồi sang ngày mới. Tiến trình được lưu trong localStorage theo phiên bản. Tải lại giữa ca bắt đầu lại từ đầu ca đó; tiền kiếm được giữa ca chưa được lưu để tránh lặp thưởng. Khi đã hết ca, tải lại đi tới ngày kế tiếp. Trình duyệt chặn lưu sẽ có thông báo trong báo cáo.

Âm thanh mặc định tắt; bật tại nút trên đầu trang. Âm hiệu và lớp nền đều tổng hợp bằng Web Audio. Font được đóng gói cục bộ nên không phụ thuộc Google Fonts khi chơi.

## Kiến trúc

- `src/scenes/ServiceScene.ts`: điều phối scene, input, phục vụ và vòng ngày; preparation / pause / summary là các trạng thái của cùng shop.
- `src/entities/`: Player, Customer và DrinkObject; ly có nguyên liệu và chất lượng độc lập.
- `src/stations/`: BaseStation cùng 6 loại trạm; phạm vi và điều kiện tương tác.
- `src/systems/`: order, pha chế, kho, kinh tế, lưu, âm thanh, điều khiển trạm và môi trường.
- `src/core/EventBus.ts`: sự kiện miền gameplay, tách khỏi event emitter của Phaser.
- `src/ui/`: HUD, bubble khách, lựa chọn nguyên liệu, báo cáo, điều khiển cảm ứng và pool hiệu ứng.
- `src/art/`: texture pixel tự vẽ bằng canvas, bake một lần rồi tái sử dụng; animation nhân vật có 4 frame.
- `src/data/recipes.ts`: 3 công thức ban đầu, màu và giá.

Các thao tác pha phải kiểm tra vị trí; chọn nguyên liệu không đóng băng ca phục vụ. UI chạy ngoài lane của nhân vật. Shop đầu tiên vừa một màn hình nên chưa cần camera scroll; camera rung nhẹ khi giao ly Perfect. Hiệu ứng text / particle dùng pool; texture được giữ lại khi đổi ngày.

## Debug và phạm vi

**F1** thêm khách + hiện debug; **F2** thêm 100.000đ; **F3** đổi thời gian ×1 / ×12; **F4** dọn khách/order; **F5** bổ sung kho. `window.__TEA_GAME__` chỉ xuất hiện trong bản dev để kiểm thử.

Bản này có 1 quán, 1 nhân vật, 5 ghế, 5 kiểu khách, 3 công thức, 3 topping, 6 trạm, nhận order trực tiếp, timing, ly trên tay, kiên nhẫn, chất lượng, combo, tiền, lưu, báo cáo và nâng cấp. Mưa xuất hiện mỗi ngày thứ ba như hiệu ứng bối cảnh.

Chưa triển khai nhân viên AI, quan hệ/cốt truyện, xếp hàng ngoài quán, di chuyển máy, mở rộng shop, thay đổi nhu cầu do thời tiết hoặc các món ngoài ba công thức. Những phần đó là giai đoạn tiếp theo, sau khi kiểm chứng vòng phục vụ.

Tất cả bối cảnh, nhân vật, texture và âm thanh được tạo riêng cho IP Tiệm Trà Mơ. Ảnh tham chiếu chỉ định hướng cách bố trí nhìn ngang; không sử dụng asset, nhân vật, UI hoặc âm thanh của game trong ảnh.
