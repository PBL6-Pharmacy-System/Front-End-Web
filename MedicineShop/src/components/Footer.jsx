import React from 'react';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Column 1: Về chúng tôi */}
          <div className="footer-column">
            <h3 className="footer-title">VỀ CHÚNG TÔI</h3>
            <ul className="footer-links">
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Hệ thống cửa hàng</a></li>
              <li><a href="#">Giấy phép kinh doanh</a></li>
              <li><a href="#">Quy chế hoạt động</a></li>
              <li><a href="#">Chính sách đặt cọc</a></li>
              <li><a href="#">Chính sách nội dung</a></li>
              <li><a href="#">Chính sách đổi trả thuốc</a></li>
              <li><a href="#">Chính sách giao hàng</a></li>
              <li><a href="#">Chính sách bảo mật dữ liệu cá nhân khách hàng</a></li>
              <li><a href="#">Chính sách thanh toán</a></li>
              <li><a href="#">Kiểm tra hóa đơn điện tử</a></li>
              <li><a href="#">Chính sách thu thập và xử lý dữ liệu cá nhân</a></li>
              <li><a href="#">Chính sách hoàn hủy đổi trả Vắc xin</a></li>
              <li><a href="#">Thông tin trung tâm bảo hành máy thiết bị y tế tổng hàng</a></li>
              <li><a href="#">Thẻ ưu đãi chương trình "Tích điểm nhận đặc quyền"</a></li>
              <li><a href="#">Điều khoản sử dụng Long Châu 247</a></li>
            </ul>
          </div>

          {/* Column 2: Danh mục */}
          <div className="footer-column">
            <h3 className="footer-title">DANH MỤC</h3>
            <ul className="footer-links">
              <li><a href="#">Thực phẩm chức năng</a></li>
              <li><a href="#">Dược mỹ phẩm</a></li>
              <li><a href="#">Thuốc</a></li>
              <li><a href="#">Chăm sóc cá nhân</a></li>
              <li><a href="#">Trang thiết bị y tế</a></li>
              <li><a href="#">Đặt thuốc online</a></li>
              <li><a href="#">Tiêm chủng Long Châu</a></li>
            </ul>
          </div>

          {/* Column 3: Tìm hiểu thêm */}
          <div className="footer-column">
            <h3 className="footer-title">TÌM HIỂU THÊM</h3>
            <ul className="footer-links">
              <li><a href="#">Góc sức khỏe</a></li>
              <li><a href="#">Tra cứu thuốc</a></li>
              <li><a href="#">Tra cứu dược chất</a></li>
              <li><a href="#">Tra cứu dược liệu</a></li>
              <li><a href="#">Bệnh thường gặp</a></li>
              <li><a href="#">Bệnh viện</a></li>
              <li><a href="#">Đội ngũ chuyên môn</a></li>
              <li><a href="#">Tin tức tuyển dụng</a></li>
              <li><a href="#">Tin tức sự kiện</a></li>
            </ul>
          </div>

          {/* Column 4: Tổng đài & Kết nối */}
          <div className="footer-column">
            <h3 className="footer-title">TỔNG ĐÀI (8:00-22:00)</h3>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">Tư vấn mua hàng</span>
                <span className="contact-number">18006928 (Nhánh 1)</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Trung tâm Vắc xin</span>
                <span className="contact-number">18006928 (Nhánh 2)</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">Góp ý, khiếu nại và tiếp nhận cảnh báo thông tin vi phạm</span>
                <span className="contact-number">18006928 (Nhánh 3)</span>
              </div>
            </div>

            <h3 className="footer-title social-title">KẾT NỐI VỚI CHÚNG TÔI</h3>
            <div className="social-media">
              <a href="https://facebook.com" className="social-link facebook" target="_blank" rel="noopener noreferrer">
                <img src="/logos/logoFb.jpg" alt="Facebook" className="social-logo-full" />
              </a>
              <a href="https://zalo.me" className="social-link zalo" target="_blank" rel="noopener noreferrer">
                <img src="/logos/logoZalo.jpg" alt="Zalo" className="social-logo-full" />
              </a>
            </div>

            <h3 className="footer-title app-title">TẢI ỨNG DỤNG LONG CHÂU</h3>
            <div className="qr-code">
              <div className="qr-placeholder">
                <div className="qr-pattern">
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-square"></div>
                  <div className="qr-logo">LC</div>
                </div>
              </div>
            </div>

            <h3 className="footer-title payment-title">CHỨNG NHẬN BỞI</h3>
            <div className="certifications">
              <div className="cert-item">DMCA</div>
              <div className="cert-item">Chứng nhận</div>
            </div>

            <h3 className="footer-title payment-title">HỖ TRỢ THANH TOÁN</h3>
            <div className="payment-methods">
              <div className="payment-row">
                <div className="payment-item visa">VISA</div>
                <div className="payment-item mastercard">MC</div>
                <div className="payment-item jcb">JCB</div>
              </div>
              <div className="payment-row">
                <div className="payment-item amex">AMEX</div>
                <div className="payment-item vnpay">VNPAY</div>
              </div>
              <div className="payment-row">
                <div className="payment-item zalopay">ZP</div>
                <div className="payment-item momo">MOMO</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <p className="copyright">
              © 2007 - 2025 Công ty Cổ Phần Dược Phẩm FPT Long Châu Số ĐKKD 0315275368 cấp ngày 17/09/2018 tại Sở Kế hoạch Đầu tư TP.HCM
            </p>
            <p className="license">
              GP thiết lập TTBĐTTH số 538/GP-TTĐT do Sở TTTT Hồ Chí Minh cấp ngày 27 tháng 03 năm 2025
            </p>
            <div className="contact-details">
              <p>• Địa chỉ: 379-381 Hai Bà Trưng, P. Xuân Hoà, TP. Hồ Chí Minh • Số điện thoại: (028)73024456 • Email: <a href="mailto:sale@nhathuoclongchau.com.vn">sale@nhathuoclongchau.com.vn</a></p>
              <p>• Người chịu trách nhiệm nội dung: Nguyễn Bạch Điệp</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
