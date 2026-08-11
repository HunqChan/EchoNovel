-- ==========================================
-- SCRIPT MOCK DATA CHO ECHONOVEL
-- Chạy script này trong MySQL Workbench hoặc phpMyAdmin
-- Chọn database echonovel_db trước khi chạy
-- ==========================================
USE echonovel_db;

-- 1. Thêm Tác giả (Authors)
INSERT IGNORE INTO authors (id, name, bio) VALUES 
(1, 'Kim Dung', 'Tiểu thuyết gia võ hiệp nổi tiếng người Trung Quốc, tác giả của Tiếu Ngạo Giang Hồ, Thần Điêu Hiệp Lữ...'),
(2, 'Nhĩ Căn', 'Tác giả nổi tiếng trong giới tiên hiệp với các tác phẩm Tiên Nghịch, Cầu Ma...'),
(3, 'Thần Đồng', 'Tác giả trẻ triển vọng với nhiều tiểu thuyết kỳ ảo.');

-- 2. Thêm Thể loại (Genres)
INSERT IGNORE INTO genres (id, name) VALUES 
(1, 'Tiên Hiệp'),
(2, 'Kiếm Hiệp'),
(3, 'Xuyên Không'),
(4, 'Hệ Thống');

-- 3. Thêm Truyện (Stories)
INSERT IGNORE INTO stories (id, title, description, cover_image, status, author_id, created_at, updated_at) VALUES 
(1, 'Tiên Nghịch', 'Vương Lâm một thiếu niên bình thường, mang theo khao khát tu tiên bước vào giới tu chân...', 'https://i.imgur.com/rN1fK6E.jpg', 'ONGOING', 2, NOW(), NOW()),
(2, 'Thần Điêu Hiệp Lữ', 'Câu chuyện tình yêu của Dương Quá và Tiểu Long Nữ giữa chốn giang hồ...', 'https://i.imgur.com/3QZ3l1Q.jpg', 'COMPLETED', 1, NOW(), NOW()),
(3, 'Đại Quản Gia Là Ma Hoàng', 'Trác Phàm - Ma Hoàng cường đại trọng sinh thành một tên gia đinh...', 'https://i.imgur.com/8B1lO6I.jpg', 'ONGOING', 3, NOW(), NOW());

-- 4. Map Truyện với Thể loại (Story_Genres)
INSERT IGNORE INTO story_genres (story_id, genre_id) VALUES 
(1, 1), (1, 3), -- Tiên Nghịch: Tiên Hiệp, Xuyên Không
(2, 2),         -- Thần Điêu: Kiếm Hiệp
(3, 1), (3, 4); -- Đại Quản Gia: Tiên Hiệp, Hệ Thống

-- 5. Thêm Chương (Chapters)
-- Truyện 1: Tiên Nghịch (3 chương)
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(1, 1, 1, 'Rời Nhà', 'Từ nhỏ Vương Lâm đã là một đứa trẻ hiểu chuyện. Nhà cậu ở gần chân núi, cha làm nghề đốn củi. Hôm nay, một vị đạo trưởng đi ngang qua làng, nhìn thấy cậu liền kinh ngạc thốt lên: "Căn cốt thật tuyệt vời!". Thế là cậu quyết định bái biệt cha mẹ, bước lên con đường tu tiên đầy gian nan.', 'PUBLIC', NOW(), NOW()),
(2, 1, 2, 'Thử Thách Đầu Tiên', 'Đến chân núi Hằng Nhạc Phái, Vương Lâm phải vượt qua ba ngàn bậc thang đá để làm bài kiểm tra nhập môn. Mồ hôi ướt đẫm áo, nhưng ánh mắt thiếu niên vẫn kiên định. "Ta nhất định phải thành Tiên!", cậu lẩm bẩm trong miệng. Cuối cùng, cậu cũng bò lên tới đỉnh núi, kiệt sức mà ngất lịm.', 'PUBLIC', NOW(), NOW()),
(3, 1, 3, 'Tụ Khí Tầng 1 (Chương VIP)', 'Sau một tháng làm tạp dịch, Vương Lâm vô tình nhặt được một viên châu kỳ lạ. Nắm viên châu trong tay, cậu cảm nhận được một luồng linh khí mát lạnh chạy dọc kinh mạch. Ầm một tiếng, rào cản Tụ Khí Tầng 1 đã bị phá vỡ! Từ đây, con đường nghịch thiên chính thức bắt đầu.', 'VIP', NOW(), NOW());

-- Truyện 2: Thần Điêu Hiệp Lữ (2 chương)
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(4, 2, 1, 'Cổ Mộ', 'Dương Quá bị Triệu Chí Kính ức hiếp, chạy trốn vào khu rừng cấm và vô tình lạc vào Cổ Mộ. Tại đây, cậu gặp Tôn bà bà và một vị thiếu nữ mặc y phục trắng muốt, dung mạo thanh lệ thoát tục. Nàng chính là Tiểu Long Nữ.', 'PUBLIC', NOW(), NOW()),
(5, 2, 2, 'Bái Sư (Cần Đăng Nhập)', 'Tiểu Long Nữ lạnh lùng nhìn Dương Quá: "Từ nay ngươi gọi ta là Cô Cô. Ở trong Cổ Mộ, quy củ đầu tiên là không được tự ý ra ngoài". Dương Quá dập đầu ba cái, chính thức trở thành đệ tử phái Cổ Mộ.', 'MEMBER', NOW(), NOW());
