-- ==========================================
-- SCRIPT MOCK DATA CHO ECHONOVEL
-- Chọn database echonovel_db trước khi chạy
-- ==========================================
USE echonovel_db;

-- 0. Xóa sạch data cũ để reset
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE story_genres;
TRUNCATE TABLE audio_files;
TRUNCATE TABLE chapters;
TRUNCATE TABLE stories;
TRUNCATE TABLE genres;
TRUNCATE TABLE authors;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Thêm Users
-- Mật khẩu cho tất cả tài khoản dưới đây đều là mã hóa của một chuỗi nhất định (bcrypt)
INSERT IGNORE INTO users (id, username, email, password, role, is_vip, created_at, updated_at) VALUES 
(1, 'admin', 'admin@echonovel.com', '$2a$12$NLn.FLy2EZHk9uhwDnW.ReJBq1CqpmAm/RP2T3qZIenrwfXtMGbBC', 'ADMIN', false, NOW(), NOW()),
(2, 'viptester', 'vip@echonovel.com', '$2a$12$NLn.FLy2EZHk9uhwDnW.ReJBq1CqpmAm/RP2T3qZIenrwfXtMGbBC', 'MEMBER', true, NOW(), NOW()),
(3, 'member1', 'member1@echonovel.com', '$2a$12$NLn.FLy2EZHk9uhwDnW.ReJBq1CqpmAm/RP2T3qZIenrwfXtMGbBC', 'MEMBER', false, NOW(), NOW()),
(4, 'member2', 'member2@echonovel.com', '$2a$12$NLn.FLy2EZHk9uhwDnW.ReJBq1CqpmAm/RP2T3qZIenrwfXtMGbBC', 'MEMBER', false, NOW(), NOW()),
(5, 'member3', 'member3@echonovel.com', '$2a$12$NLn.FLy2EZHk9uhwDnW.ReJBq1CqpmAm/RP2T3qZIenrwfXtMGbBC', 'MEMBER', false, NOW(), NOW());

-- 2. Thêm Tác giả (Authors)
INSERT IGNORE INTO authors (id, name, bio) VALUES 
(1, 'Kim Dung', 'Tiểu thuyết gia võ hiệp nổi tiếng người Trung Quốc, tác giả của Tiếu Ngạo Giang Hồ, Thần Điêu Hiệp Lữ...'),
(2, 'Nhĩ Căn', 'Tác giả nổi tiếng trong giới tiên hiệp với các tác phẩm Tiên Nghịch, Cầu Ma...'),
(3, 'Thần Đồng', 'Tác giả trẻ triển vọng với nhiều tiểu thuyết kỳ ảo.'),
(4, 'Mực Thích Lặn Nước', 'Tác giả của Quỷ Bí Chi Chủ, một trong những tiểu thuyết ăn khách nhất thời đại mới.'),
(5, 'Thiên Tằm Thổ Đậu', 'Cha đẻ của Đấu Phá Thương Khung, Vũ Động Càn Khôn, Đại Chúa Tể.'),
(6, 'Đường Gia Tam Thiếu', 'Tác giả Đấu La Đại Lục, là một trong những cây bút có thu nhập cao nhất Trung Quốc.');

-- 3. Thêm Thể loại (Genres)
INSERT IGNORE INTO genres (id, name) VALUES 
(1, 'Tiên Hiệp'),
(2, 'Kiếm Hiệp'),
(3, 'Xuyên Không'),
(4, 'Hệ Thống'),
(5, 'Huyền Huyễn'),
(6, 'Dị Giới'),
(7, 'Đô Thị'),
(8, 'Khoa Huyễn');

-- 4. Thêm Truyện (Stories)
INSERT IGNORE INTO stories (id, title, description, cover_image, status, author_id, created_at, updated_at) VALUES 
(1, 'Tiên Nghịch', 'Vương Lâm một thiếu niên bình thường, mang theo khao khát tu tiên bước vào giới tu chân...', 'https://cdn.truyenhoan.com/medias/covers/0/2-tien-nghich_cover_large.jpg', 'ONGOING', 2, NOW(), NOW()),
(2, 'Thần Điêu Hiệp Lữ', 'Câu chuyện tình yêu của Dương Quá và Tiểu Long Nữ giữa chốn giang hồ...', 'https://tse4.mm.bing.net/th/id/OIP.zHOw1gNYMdfwgGSWTpDKXQHaK4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'COMPLETED', 1, NOW(), NOW()),
(3, 'Đại Quản Gia Là Ma Hoàng', 'Trác Phàm - Ma Hoàng cường đại trọng sinh thành một tên gia đinh...', 'https://tse1.mm.bing.net/th/id/OIP.sNI_Xn0aNHp0s6TKnkXpTgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'ONGOING', 3, NOW(), NOW()),
(4, 'Quỷ Bí Chi Chủ', 'Trong cơn thủy triều của hơi nước cùng máy móc, ai có thể chạm đến những sức mạnh phi phàm...', 'https://tse3.mm.bing.net/th/id/OIP.oMW42eitneho6NqeYjt51gHaLH?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'COMPLETED', 4, NOW(), NOW()),
(5, 'Đấu Phá Thương Khung', 'Tại một đại lục không có ma pháp, chỉ có đấu khí tu luyện đến đỉnh phong...', 'https://th.bing.com/th/id/OIP.pps4GkC5fE6E7ZjRawWPFAHaKL?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3', 'COMPLETED', 5, NOW(), NOW()),
(6, 'Đấu La Đại Lục', 'Đường San mang theo tuyệt học Đấu La Đường Môn xuyên không đến đại lục không có võ thuật...', 'https://tse1.mm.bing.net/th/id/OIP.0GztfFWHejxoXoOQSq-9SgHaLL?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'ONGOING', 6, NOW(), NOW()),
(7, 'Cầu Ma', 'Truyền thuyết kể rằng, ma là do người tạo ra. Tô Minh bắt đầu hành trình tìm kiếm ý nghĩa của ma...', 'https://tse1.mm.bing.net/th/id/OIP.WOu7hGjNCFTCYnDeczOiJgHaKS?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'COMPLETED', 2, NOW(), NOW()),
(8, 'Vũ Động Càn Khôn', 'Lâm Động, một thiếu niên xuất thân từ gia tộc suy vi, tình cờ có được thạch phù thần bí...', 'https://tse4.mm.bing.net/th/id/OIP.F8KzTdYQ3VHMd1M4-7SfjAHaKZ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', 'ONGOING', 5, NOW(), NOW());

-- 5. Map Truyện với Thể loại (Story_Genres)
INSERT IGNORE INTO story_genres (story_id, genre_id) VALUES 
(1, 1), (1, 3), 
(2, 2),         
(3, 1), (3, 4), 
(4, 5), (4, 3), (4, 8), 
(5, 5), (5, 6), 
(6, 5), (6, 3), 
(7, 1), (7, 5), 
(8, 5), (8, 6); 

-- 6. Thêm Chương (Chapters)
-- Truyện 1: Tiên Nghịch
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(1, 1, 1, 'Rời Nhà', 'Từ nhỏ Vương Lâm đã là một đứa trẻ hiểu chuyện. Nhà cậu ở gần chân núi, cha làm nghề đốn củi. Hôm nay, một vị đạo trưởng đi ngang qua làng, nhìn thấy cậu liền kinh ngạc thốt lên: "Căn cốt thật tuyệt vời!". Thế là cậu quyết định bái biệt cha mẹ, bước lên con đường tu tiên đầy gian nan.', 'PUBLIC', NOW(), NOW()),
(2, 1, 2, 'Thử Thách Đầu Tiên', 'Đến chân núi Hằng Nhạc Phái, Vương Lâm phải vượt qua ba ngàn bậc thang đá để làm bài kiểm tra nhập môn. Mồ hôi ướt đẫm áo, nhưng ánh mắt thiếu niên vẫn kiên định. "Ta nhất định phải thành Tiên!", cậu lẩm bẩm trong miệng. Cuối cùng, cậu cũng bò lên tới đỉnh núi, kiệt sức mà ngất lịm.', 'PUBLIC', NOW(), NOW()),
(3, 1, 3, 'Tụ Khí Tầng 1 (Cần Đăng Nhập)', 'Sau một tháng làm tạp dịch, Vương Lâm vô tình nhặt được một viên châu kỳ lạ. Nắm viên châu trong tay, cậu cảm nhận được một luồng linh khí mát lạnh chạy dọc kinh mạch. Ầm một tiếng, rào cản Tụ Khí Tầng 1 đã bị phá vỡ! Từ đây, con đường nghịch thiên chính thức bắt đầu.', 'MEMBER', NOW(), NOW()),
(4, 1, 4, 'Bí Cảnh (Chương VIP)', 'Bước vào bí cảnh, Vương Lâm phát hiện ra vô số kỳ hoa dị thảo. Hắn cẩn thận hái từng loại, cất vào trong túi trữ vật. Đột nhiên, một con yêu thú to lớn xuất hiện trước mặt, gầm lên giận dữ.', 'VIP', NOW(), NOW()),
(5, 1, 5, 'Tranh Đoạt (Chương VIP)', 'Những tu sĩ khác bắt đầu tràn vào bí cảnh. Vương Lâm nấp sau một tảng đá, quan sát bọn họ tranh giành một gốc linh thảo ngàn năm. Một cuộc chiến đẫm máu nổ ra, pháp bảo bay lượn khắp nơi.', 'VIP', NOW(), NOW());

-- Truyện 2: Thần Điêu Hiệp Lữ
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(6, 2, 1, 'Cổ Mộ', 'Dương Quá bị Triệu Chí Kính ức hiếp, chạy trốn vào khu rừng cấm và vô tình lạc vào Cổ Mộ. Tại đây, cậu gặp Tôn bà bà và một vị thiếu nữ mặc y phục trắng muốt, dung mạo thanh lệ thoát tục. Nàng chính là Tiểu Long Nữ.', 'PUBLIC', NOW(), NOW()),
(7, 2, 2, 'Bái Sư', 'Tiểu Long Nữ lạnh lùng nhìn Dương Quá: "Từ nay ngươi gọi ta là Cô Cô. Ở trong Cổ Mộ, quy củ đầu tiên là không được tự ý ra ngoài". Dương Quá dập đầu ba cái, chính thức trở thành đệ tử phái Cổ Mộ.', 'PUBLIC', NOW(), NOW()),
(8, 2, 3, 'Luyện Công (Cần Đăng Nhập)', 'Hai thầy trò cùng nhau luyện Ngọc Nữ Tâm Kinh trong hàn băng thạch thất. Lạnh buốt thấu xương, nhưng Dương Quá cắn răng chịu đựng, không hé răng than vãn nửa lời.', 'MEMBER', NOW(), NOW()),
(9, 2, 4, 'Rời Cổ Mộ (Chương VIP)', 'Vì Lý Mạc Sầu tấn công, Dương Quá và Tiểu Long Nữ buộc phải rời khỏi Cổ Mộ, bắt đầu bước chân vào giang hồ đầy rẫy hiểm ác và thị phi.', 'VIP', NOW(), NOW());

-- Truyện 3: Đại Quản Gia Là Ma Hoàng
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(10, 3, 1, 'Trọng Sinh', 'Trác Phàm mở mắt ra, thấy mình đang ở một nơi xa lạ. Đầu đau như búa bổ, những ký ức hỗn loạn ùa về. Hắn, Ma Hoàng khét tiếng một thời, nay lại trọng sinh vào thân xác một tên phàm nhân.', 'PUBLIC', NOW(), NOW()),
(11, 3, 2, 'Lạc Gia', 'Hắn hiện thân dưới thân phận một tên gia đinh của Lạc gia. Cả gia tộc đang chìm trong biển máu vì bị kẻ thù truy sát. Nhìn thấy thảm cảnh, ánh mắt Trác Phàm xẹt qua một tia lạnh lẽo.', 'PUBLIC', NOW(), NOW()),
(12, 3, 3, 'Bảo Vệ Đại Tiểu Thư (Cần Đăng Nhập)', 'Lạc Vân Thường bị kẻ địch dồn vào chân tường, tuyệt vọng nhắm mắt chờ chết. Đúng lúc đó, Trác Phàm xuất hiện, tung ra một chưởng đẩy lùi đám thích khách.', 'MEMBER', NOW(), NOW()),
(13, 3, 4, 'Hệ Thống Thức Tỉnh (Chương VIP)', 'Bất ngờ một âm thanh vang lên trong đầu hắn: "Hệ Thống Tối Thượng đã được kích hoạt". Một bảng thông số hiện lên trước mắt, hiển thị các nhiệm vụ và phần thưởng phong phú.', 'VIP', NOW(), NOW()),
(14, 3, 5, 'Trận Chiến Đầu Tiên (Chương VIP)', 'Sử dụng sức mạnh mới từ hệ thống, hắn dễ dàng tiêu diệt đám tay sai của kẻ thù. Lạc Vân Thường nhìn hắn bằng ánh mắt khiếp sợ xen lẫn ngưỡng mộ.', 'VIP', NOW(), NOW());

-- Truyện 4: Quỷ Bí Chi Chủ
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(15, 4, 1, 'Màu Đỏ Tươi', 'Chu Minh Thụy thức dậy với một cơn đau đầu dữ dội, trên bàn là một khẩu súng lục và những vết máu đỏ tươi. Cửa sổ mở toang, gió lạnh lùa vào mang theo hơi thở của sương mù.', 'PUBLIC', NOW(), NOW()),
(16, 4, 2, 'Klein Moretti', 'Hắn nhận ra mình đã xuyên không vào cơ thể của một thanh niên tên Klein Moretti ở thế giới mang phong cách Victoria, nơi ma thuật và hơi nước cùng tồn tại.', 'PUBLIC', NOW(), NOW()),
(17, 4, 3, 'Nghi Thức Đổi Vận (Cần Đăng Nhập)', 'Nhớ lại nghi thức phép thuật từng đọc, hắn chuẩn bị 4 mẩu thức ăn chính để thử vận may, cầu mong được trở về thế giới cũ.', 'MEMBER', NOW(), NOW()),
(18, 4, 4, 'Sương Mù Xám (Chương VIP)', 'Một không gian sương mù xám vô tận mở ra, hắn ngồi trên chiếc ghế đồng dài ở vị trí chủ tọa. Trước mặt hắn là một chiếc bàn dài cổ kính.', 'VIP', NOW(), NOW()),
(19, 4, 5, 'Người Treo Ngược và Công Lý (Chương VIP)', 'Hai bóng người xuất hiện trong không gian sương mù. Cuộc hội nghị thần bí đầu tiên bắt đầu dưới sự chủ trì của hắn, kẻ tự xưng là "Kẻ Khờ".', 'VIP', NOW(), NOW());

-- Truyện 5: Đấu Phá Thương Khung
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(20, 5, 1, 'Phế Vật', 'Tiêu Viêm, thiên tài một thời của Tiêu gia, giờ đây đấu khí hoàn toàn biến mất, trở thành phế vật bị người người khinh bỉ. Mỗi ngày đều là những lời châm chọc đâm thẳng vào tim.', 'PUBLIC', NOW(), NOW()),
(21, 5, 2, 'Từ Hôn', 'Nạp Lan Yên Nhiên của Vân Lam Tông mang theo hôn ước đến Tiêu gia, nhưng mục đích là để từ hôn. Tiêu Viêm nắm chặt tay, cắn răng viết tờ hưu thư: "Ba năm sau, ta sẽ đích thân lên Vân Lam Tông!".', 'PUBLIC', NOW(), NOW()),
(22, 5, 3, 'Dược Lão (Cần Đăng Nhập)', 'Một giọng nói già nua vang lên từ chiếc nhẫn màu đen mà mẹ Tiêu Viêm để lại. Từ đó, hắn biết được lý do mình bị mất đấu khí và bắt đầu bước lên con đường tu luyện mới.', 'MEMBER', NOW(), NOW()),
(23, 5, 4, 'Luyện Dược Sư (Chương VIP)', 'Dược Lão nhận Tiêu Viêm làm đệ tử, bắt đầu truyền thụ kiến thức về Luyện Dược Sư. Hắn dần nắm giữ dị hỏa, chế luyện ra những viên đan dược quý giá.', 'VIP', NOW(), NOW()),
(24, 5, 5, 'Ma Thú Sơn Mạch (Chương VIP)', 'Để nhanh chóng tăng cường thực lực, Tiêu Viêm một mình tiến vào Ma Thú Sơn Mạch rèn luyện, đối mặt với vô vàn nguy hiểm sinh tử.', 'VIP', NOW(), NOW());

-- Truyện 6: Đấu La Đại Lục
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(25, 6, 1, 'Đường Tam', 'Đường Tam, ngoại môn đệ tử của Đường Môn, vì lén học nội môn tuyệt học mà bị bức phải nhảy vực tự sát. Hắn xuyên không đến thế giới Đấu La Đại Lục.', 'PUBLIC', NOW(), NOW()),
(26, 6, 2, 'Vũ Hồn', 'Tại thế giới Đấu La Đại Lục, mỗi người khi lên 6 tuổi đều sẽ thức tỉnh một thứ gọi là Vũ Hồn. Vũ Hồn quyết định vận mệnh và sức mạnh của mỗi cá nhân.', 'PUBLIC', NOW(), NOW()),
(27, 6, 3, 'Tiên Thiên Mãn Hồn Lực (Cần Đăng Nhập)', 'Vũ hồn của Đường Tam là Lam Ngân Thảo bị coi là phế vũ hồn, nhưng hắn lại sở hữu Tiên Thiên Mãn Hồn Lực, một trường hợp cực hiếm.', 'MEMBER', NOW(), NOW()),
(28, 6, 4, 'Học Viện Nặc Đinh (Chương VIP)', 'Đường Tam tạm biệt cha, đến học viện Nặc Đinh để bắt đầu con đường trở thành Hồn Sư. Hắn quyết tâm chứng minh Lam Ngân Thảo không phải là phế vũ hồn.', 'VIP', NOW(), NOW()),
(29, 6, 5, 'Tiểu Vũ (Chương VIP)', 'Tại ký túc xá, hắn gặp một cô bé xinh xắn, hai bím tóc dài, tự xưng là Tiểu Vũ. Hai người nhanh chóng trở thành bạn thân thiết, cùng nhau luyện tập.', 'VIP', NOW(), NOW());

-- Truyện 7: Cầu Ma
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(30, 7, 1, 'Thiếu Niên Tô Minh', 'Tô Minh sống tại Ô Sơn Bộ, một bộ lạc nhỏ bé luôn phải chống chọi với thú dữ và bão tuyết. Hắn khát khao sức mạnh để bảo vệ những người thân yêu.', 'PUBLIC', NOW(), NOW()),
(31, 7, 2, 'Mặt Dây Chuyền', 'Bí mật lớn nhất của Tô Minh là mặt dây chuyền bằng đá trên ngực, luôn phát ra hơi ấm kỳ lạ vào những đêm trăng rằm.', 'PUBLIC', NOW(), NOW()),
(32, 7, 3, 'Man Tộc (Cần Đăng Nhập)', 'Truyền thuyết về Man Tộc hùng mạnh thuở xa xưa luôn thôi thúc trái tim của chàng thiếu niên. Hắn muốn tìm hiểu nguồn gốc sức mạnh của chính mình.', 'MEMBER', NOW(), NOW()),
(33, 7, 4, 'Biến Cố (Chương VIP)', 'Một đêm nọ, bộ lạc Hắc Sơn bất ngờ tấn công Ô Sơn Bộ, máu chảy thành sông. Tô Minh gào thét trong tuyệt vọng, sức mạnh trong mặt dây chuyền bỗng nhiên bùng phát.', 'VIP', NOW(), NOW());

-- Truyện 8: Vũ Động Càn Khôn
INSERT IGNORE INTO chapters (id, story_id, chapter_number, title, content, access_level, created_at, updated_at) VALUES 
(34, 8, 1, 'Lâm Động', 'Tại Thanh Dương Trấn, Lâm Động nghiến răng nhìn cha mình bị Lâm Lang Thiên đả thương thành tàn phế. Hắn thề sẽ trả thù và rửa sạch nhục nhã này.', 'PUBLIC', NOW(), NOW()),
(35, 8, 2, 'Thạch Phù', 'Vô tình rơi xuống một vách đá, hắn tìm thấy một viên đá kỳ lạ hình cái bùa, bên trong chứa đựng sức mạnh thần bí có thể cải thiện thể chất.', 'PUBLIC', NOW(), NOW()),
(36, 8, 3, 'Thối Thể (Cần Đăng Nhập)', 'Nhờ vào Thạch Phù, tốc độ tu luyện Thối Thể Cửu Trọng của Lâm Động tăng lên đáng kinh ngạc, vượt xa những thiên tài trong gia tộc.', 'MEMBER', NOW(), NOW()),
(37, 8, 4, 'Tranh Tài Gia Tộc (Chương VIP)', 'Tại cuộc thi đấu của gia tộc, Lâm Động đã đánh bại đối thủ mạnh nhất, giành lại danh dự cho cha, khiến mọi người khiếp sợ và thán phục.', 'VIP', NOW(), NOW());
