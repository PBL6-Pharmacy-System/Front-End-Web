import json
import os
from subcategory_mapping import SUBCATEGORY_MAP

# Mapping các category với subcategories từ categories.js
CATEGORY_MAPPING = {
    "ho-tro-dieu-tri": {
        "name": "Hỗ trợ điều trị",
        "subcategories": [
            {"key": "dieu-tri-tieu-duong", "name": "Hỗ trợ điều trị tiểu đường"},
            {"key": "ho-tro-xuong-khop", "name": "Hỗ trợ xương khớp"},
            {"key": "ho-tro-ho-hap", "name": "Hỗ trợ hô hấp"}
        ]
    },
    "ho-tro-tieu-hoa": {
        "name": "Hỗ trợ tiêu hóa",
        "subcategories": [
            {"key": "men-vi-sinh", "name": "Men vi sinh"},
            {"key": "ho-tro-gan-mat", "name": "Hỗ trợ gan mật"},
            {"key": "ho-tro-da-day", "name": "Hỗ trợ dạ dày"}
        ]
    },
    "than-kinh-nao": {
        "name": "Thần kinh não",
        "subcategories": [
            {"key": "tang-tri-nho", "name": "Tăng cường trí nhớ"},
            {"key": "giam-stress", "name": "Giảm stress, lo âu"},
            {"key": "ho-tro-giac-ngu", "name": "Hỗ trợ giấc ngủ"}
        ]
    },
    "ho-tro-lam-dep": {
        "name": "Hỗ trợ làm đẹp",
        "subcategories": [
            {"key": "lam-dep-da", "name": "Làm đẹp da"},
            {"key": "cham-soc-toc-dep", "name": "Chăm sóc tóc"},
            {"key": "cham-soc-mong", "name": "Chăm sóc móng"}
        ]
    },
    "suc-khoe-tim-mach": {
        "name": "Sức khỏe tim mạch",
        "subcategories": [
            {"key": "ho-tro-tim-mach", "name": "Hỗ trợ tim mạch"},
            {"key": "ho-tro-huyet-ap", "name": "Hỗ trợ huyết áp"},
            {"key": "ho-tro-tuan-hoan", "name": "Hỗ trợ tuần hoàn"}
        ]
    },
    "dinh-duong": {
        "name": "Dinh dưỡng",
        "subcategories": [
            {"key": "dinh-duong-tre-em", "name": "Dinh dưỡng trẻ em"},
            {"key": "dinh-duong-ba-bau", "name": "Dinh dưỡng bà bầu"},
            {"key": "dinh-duong-nguoi-gia", "name": "Dinh dưỡng người già"}
        ]
    },
    "cham-soc-da-mat": {
        "name": "Chăm sóc da mặt",
        "subcategories": [
            {"key": "sua-rua-mat", "name": "Sữa rửa mặt (Kem, gel, sữa)"},
            {"key": "kem-chong-nang", "name": "Kem chống nắng da mặt"},
            {"key": "duong-da-mat", "name": "Dưỡng da mặt"},
            {"key": "mat-na", "name": "Mặt nạ"},
            {"key": "serum-essence", "name": "Serum, Essence hoặc Ampoule"}
        ]
    },
    "cham-soc-co-the": {
        "name": "Chăm sóc cơ thể",
        "subcategories": [
            {"key": "sua-tam", "name": "Sữa tắm"},
            {"key": "kem-duong-the", "name": "Kem dưỡng thể"},
            {"key": "tay-te-bao-chet", "name": "Tẩy tế bào chết"}
        ]
    },
    "giai-phap-lan-da": {
        "name": "Giải pháp làn da",
        "subcategories": [
            {"key": "tri-mun", "name": "Trị mụn"},
            {"key": "tri-tham-nam", "name": "Trị thâm nám"},
            {"key": "da-nhay-cam", "name": "Da nhạy cảm"}
        ]
    },
    "cham-soc-toc": {
        "name": "Chăm sóc tóc - da đầu",
        "subcategories": [
            {"key": "dau-goi", "name": "Dầu gội"},
            {"key": "dau-xa", "name": "Dầu xả"},
            {"key": "mat-na-toc", "name": "Mặt nạ tóc"}
        ]
    },
    "my-pham-trang-diem": {
        "name": "Mỹ phẩm trang điểm",
        "subcategories": [
            {"key": "son-moi", "name": "Son môi"},
            {"key": "trang-diem-mat", "name": "Trang điểm mắt"},
            {"key": "kem-nen", "name": "Kem nền"}
        ]
    },
    "cham-soc-vung-mat": {
        "name": "Chăm sóc da vùng mắt",
        "subcategories": [
            {"key": "kem-duong-mat", "name": "Kem dưỡng mắt"},
            {"key": "mat-na-mat", "name": "Mặt nạ mắt"},
            {"key": "serum-mat", "name": "Serum mắt"}
        ]
    },
    "thao-duoc-thien-nhien": {
        "name": "Thảo dược thiên nhiên",
        "subcategories": [
            {"key": "dong-y", "name": "Đông y"},
            {"key": "tra-thao-moc", "name": "Trà thảo mộc"},
            {"key": "cao-duoc-lieu", "name": "Cao dược liệu"}
        ]
    },
    "ho-tro-tinh-duc": {
        "name": "Hỗ trợ tình dục",
        "subcategories": [
            {"key": "tang-cuong-sinh-luc-nam", "name": "Tăng cường sinh lực nam"},
            {"key": "cham-soc-sinh-ly-nu", "name": "Chăm sóc sinh lý nữ"}
        ]
    },
    "thuc-pham-do-uong": {
        "name": "Thực phẩm & đồ uống",
        "subcategories": [
            {"key": "tra-cafe", "name": "Trà & Cà phê"},
            {"key": "banh-keo", "name": "Bánh kẹo"},
            {"key": "do-uong-bo-duong", "name": "Đồ uống bổ dưỡng"}
        ]
    },
    "ve-sinh-ca-nhan": {
        "name": "Vệ sinh cá nhân",
        "subcategories": [
            {"key": "bang-ve-sinh", "name": "Băng vệ sinh"},
            {"key": "bao-cao-su", "name": "Bao cao su"},
            {"key": "dung-dich-ve-sinh", "name": "Dung dịch vệ sinh"}
        ]
    },
    "cham-soc-rang-mieng": {
        "name": "Chăm sóc răng miệng",
        "subcategories": [
            {"key": "kem-danh-rang", "name": "Kem đánh răng"},
            {"key": "ban-chai", "name": "Bàn chải"},
            {"key": "nuoc-suc-mieng", "name": "Nước súc miệng"}
        ]
    },
    "do-dung-gia-dinh": {
        "name": "Đồ dùng gia đình",
        "subcategories": [
            {"key": "dung-dich-giat-xa", "name": "Dung dịch giặt xả"},
            {"key": "che-pham-lau-nha", "name": "Chế phẩm lau nhà"},
            {"key": "khu-trung", "name": "Khử trùng"}
        ]
    },
    "hang-tieu-dung": {
        "name": "Hàng tiêu dùng",
        "subcategories": [
            {"key": "giay-uot", "name": "Giấy ướt"},
            {"key": "ta-giay", "name": "Tã giấy"},
            {"key": "khan-giay", "name": "Khăn giấy"}
        ]
    },
    "tinh-dau": {
        "name": "Tinh dầu",
        "subcategories": [
            {"key": "tinh-dau-thien-nhien", "name": "Tinh dầu thiên nhiên"},
            {"key": "tinh-dau-massage", "name": "Tinh dầu massage"},
            {"key": "may-xong-tinh-dau", "name": "Máy xông tinh dầu"}
        ]
    },
    "may-lam-dep": {
        "name": "Máy làm đẹp",
        "subcategories": [
            {"key": "may-rua-mat", "name": "Máy rửa mặt"},
            {"key": "may-massage", "name": "Máy massage"},
            {"key": "may-tay-long", "name": "Máy tẩy lông"}
        ]
    },
    "dung-cu-y-te": {
        "name": "Dụng cụ y tế",
        "subcategories": [
            {"key": "kim-tiem", "name": "Kim tiêm"},
            {"key": "bang-gac", "name": "Băng gạc"},
            {"key": "ong-nghe", "name": "Ống nghe"},
            {"key": "que-thu-thai", "name": "Que thử thai"},
            {"key": "nhiet-ke", "name": "Nhiệt kế"}
        ]
    },
    "thiet-bi-theo-doi": {
        "name": "Thiết bị theo dõi",
        "subcategories": [
            {"key": "may-do-huyet-ap", "name": "Máy đo huyết áp"},
            {"key": "may-do-duong-huyet", "name": "Máy đo đường huyết"},
            {"key": "can-suc-khoe", "name": "Cân sức khỏe"}
        ]
    },
    "khau-trang": {
        "name": "Khẩu trang",
        "subcategories": [
            {"key": "khau-trang-y-te", "name": "Khẩu trang y tế"},
            {"key": "khau-trang-n95", "name": "Khẩu trang N95"},
            {"key": "khau-trang-vai", "name": "Khẩu trang vải"}
        ]
    }
}

def generate_fake_products(category_key, subcategory_key, subcategory_name, start_id):
    """Tạo 3 sản phẩm fake cho mỗi subcategory"""
    products = []
    
    # Template tên sản phẩm theo category
    product_templates = {
        "ho-tro-dieu-tri": ["Viên uống", "Thuốc bổ", "Cao"],
        "ho-tro-tieu-hoa": ["Men vi sinh", "Viên nang", "Bột"],
        "than-kinh-nao": ["Viên bổ não", "Thuốc ngủ", "Viên giảm stress"],
        "ho-tro-lam-dep": ["Viên uống đẹp da", "Collagen", "Viên chống lão hóa"],
        "suc-khoe-tim-mach": ["Viên bổ tim", "Omega-3", "Viên giảm cholesterol"],
        "dinh-duong": ["Sữa bột dinh dưỡng", "Viên bổ sung", "Bột protein"],
        "cham-soc-da-mat": ["Kem dưỡng", "Sữa rửa mặt", "Serum"],
        "cham-soc-co-the": ["Sữa tắm", "Kem body", "Xịt khử mùi"],
        "giai-phap-da": ["Gel trị mụn", "Kem trị nám", "Kem dưỡng da"],
        "cham-soc-toc": ["Dầu gội", "Dầu xả", "Serum dưỡng tóc"],
        "trang-diem": ["Son môi", "Phấn mắt", "Mascara"],
        "cham-soc-mat": ["Thuốc nhỏ mắt", "Nước rửa mắt", "Nước ngâm lens"],
        "thao-duoc-thien-nhien": ["Trà thảo mộc", "Cao dược liệu", "Viên đông y"],
        "ho-tro-tinh-duc": ["Viên tăng cường", "Thuốc bổ", "Viên hỗ trợ"],
        "thuc-pham-do-uong": ["Trà", "Cà phê", "Nước uống bổ dưỡng"],
        "ve-sinh-ca-nhan": ["Băng vệ sinh", "Bao cao su", "Dung dịch"],
        "cham-soc-rang-mieng": ["Kem đánh răng", "Bàn chải", "Nước súc miệng"],
        "do-dung-gia-dinh": ["Nước giặt", "Nước lau nhà", "Xịt khử trùng"],
        "hang-tieu-dung": ["Giấy ướt", "Tã giấy", "Khăn giấy"],
        "tinh-dau": ["Tinh dầu", "Tinh dầu massage", "Máy xông"],
        "may-lam-dep": ["Máy rửa mặt", "Máy massage", "Máy"],
        "dung-cu-y-te": ["Băng gạc", "Kim tiêm", "Nhiệt kế"],
        "thiet-bi-theo-doi": ["Máy đo", "Thiết bị", "Cân"],
        "khau-trang": ["Khẩu trang", "Khẩu trang y tế", "Khẩu trang"]
    }
    
    templates = product_templates.get(category_key, ["Sản phẩm", "Viên uống", "Thuốc"])
    
    for i in range(3):
        product_id = start_id + i
        # Map lại tên tiếng Việt đầy đủ cho subcategory
        viet_name = None
        # Tìm tên tiếng Việt từ mapping (SUBCATEGORY_MAP: tên tiếng Việt -> key)
        for k, v in SUBCATEGORY_MAP.items():
            if v == subcategory_key:
                viet_name = k
                break
        if not viet_name:
            viet_name = subcategory_name
        products.append({
            "id": product_id,
            "name": f"{templates[i]} {viet_name} {i+1}",
            "image": "https://via.placeholder.com/150",
            "discount": f"{8 + i*2}%",
            "price": str(250000 + i * 100000),
            "support": str(int((250000 + i * 100000) * (1 - (8 + i*2) / 100))),
            "description": f"Sản phẩm {viet_name} chất lượng cao, nhập khẩu chính hãng",
            "quantity": "Hộp 60 viên" if "viên" in templates[i].lower() else "Hộp 1 sản phẩm",
            "category": category_key,
            "subcategory": viet_name,
            "inStock": True,
            "sold": 100 + i * 50,
            "stock": 200 + i * 50
        })
    return products

def convert_file(file_path, category_key):
    """Chuyển đổi một file sang format mới"""
    try:
        # Đọc file cũ
        with open(file_path, 'r', encoding='utf-8') as f:
            old_data = json.load(f)
        
        # Lấy thông tin category
        category_info = CATEGORY_MAPPING.get(category_key)
        if not category_info:
            print(f"⚠️  Không tìm thấy mapping cho {category_key}")
            return False
        
        # Tạo cấu trúc mới
        new_data = {
            "category": category_key,
            "categoryName": category_info["name"],
            "subcategories": []
        }

        # Map key -> tên tiếng Việt từ mapping (SUBCATEGORY_MAP: tên tiếng Việt -> key)
        key_to_vietname = {v: k for k, v in SUBCATEGORY_MAP.items()}

        # Tạo products cho mỗi subcategory
        start_id = 1000 + len(new_data["subcategories"]) * 100
        for idx, subcat in enumerate(category_info["subcategories"]):
            viet_name = key_to_vietname.get(subcat["key"], subcat.get("name", subcat["key"]))
            subcategory_data = {
                "key": subcat["key"],
                "name": viet_name,
                "products": generate_fake_products(
                    category_key,
                    subcat["key"],
                    viet_name,
                    start_id + idx * 3
                )
            }
            new_data["subcategories"].append(subcategory_data)
        
        # Ghi file mới
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(new_data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Đã convert: {os.path.basename(file_path)}")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi convert {file_path}: {str(e)}")
        return False

# Danh sách các file cần convert
FILES_TO_CONVERT = [
    ("treatmentSupportProducts.json", "ho-tro-dieu-tri"),
    ("digestiveProducts.json", "ho-tro-tieu-hoa"),
    ("brainProducts.json", "than-kinh-nao"),
    ("beautyProducts.json", "ho-tro-lam-dep"),
    ("cardiovascularProducts.json", "suc-khoe-tim-mach"),
    ("nutritionProducts.json", "dinh-duong"),
    ("faceCareProducts.json", "cham-soc-da-mat"),
    ("bodyCareProducts.json", "cham-soc-co-the"),
    ("skinSolutionProducts.json", "giai-phap-da"),
    ("hairCareProducts.json", "cham-soc-toc"),
    ("makeupProducts.json", "trang-diem"),
    ("eyeCareProducts.json", "cham-soc-mat"),
    ("naturalProducts.json", "thao-duoc-thien-nhien"),
    ("sexualHealthProducts.json", "ho-tro-tinh-duc"),
    ("foodDrinkProducts.json", "thuc-pham-do-uong"),
    ("personalHygieneProducts.json", "ve-sinh-ca-nhan"),
    ("dentalCareProducts.json", "cham-soc-rang-mieng"),
    ("householdProducts.json", "do-dung-gia-dinh"),
    ("generalProducts.json", "hang-tieu-dung"),
    ("essentialOilProducts.json", "tinh-dau"),
    ("beautyDeviceProducts.json", "may-lam-dep"),
    ("medicalDeviceProducts.json", "dung-cu-y-te"),
    ("monitoringDeviceProducts.json", "thiet-bi-theo-doi"),
    ("maskProducts.json", "khau-trang"),
]

if __name__ == "__main__":
    data_dir = r"e:\PBL6\medicineShop-no1 - Copy\MedicineShop\src\data"
    
    print("🚀 Bắt đầu convert các file...\n")
    
    success_count = 0
    total_count = len(FILES_TO_CONVERT)
    
    for filename, category_key in FILES_TO_CONVERT:
        file_path = os.path.join(data_dir, filename)
        if os.path.exists(file_path):
            if convert_file(file_path, category_key):
                success_count += 1
        else:
            print(f"⚠️  File không tồn tại: {filename}")
    
    print(f"\n✨ Hoàn thành! Đã convert {success_count}/{total_count} files")
