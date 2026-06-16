---
title: Phân Tích Kỹ Thuật Card Đồ Họa NVIDIA — Từ Kiến Trúc Đến Hiệu Năng
date: 2026-06-16
summary: Đi sâu vào kiến trúc, bộ nhớ, quy trình sản xuất và các chỉ số hiệu năng của card đồ họa NVIDIA qua các thế hệ Turing, Ampere, Ada Lovelace và Blackwell.
wordCount: 2150
readTime: 10 min
tags: ['hardware', 'nvidia', 'gpu', 'deep-dive']
---

# Phân Tích Kỹ Thuật Card Đồ Họa NVIDIA — Từ Kiến Trúc Đến Hiệu Năng

Khi nói về card đồ họa dành cho gaming, đồ họa chuyên nghiệp hay AI/ML, NVIDIA là cái tên chiếm vị thế thống trị suốt hơn một thập kỷ. Nhưng đằng sau những con số TFLOPS và dòng chữ "RTX" quen thuộc là một kiến trúc silicon cực kỳ phức tạp, được tối ưu hóa từng milimet để cân bằng giữa hiệu năng, điện năng và chi phí sản xuất.

Bài viết này sẽ phân tích chi tiết các khía cạnh kỹ thuật của card đồ họa NVIDIA: từ cách tổ chức CUDA cores, Tensor cores, RT cores; bộ nhớ và băng thông; quy trình sản xuất; cho đến sự khác biệt giữa các thế hệ kiến trúc Turing, Ampere, Ada Lovelace và Blackwell.

## 1. Kiến trúc tổng quan của một GPU NVIDIA

Một GPU NVIDIA hiện đại có thể được hình dung như một "siêu máy tính thu nhỏ" với hàng nghìn bộ xử lý song song. Khác với CPU tập trung vào một vài nhân mạnh xử lý tuần tự, GPU được thiết kế để xử lý đồng thởi một lượng lớn phép tính đơn giản — điều này phù hợp hoàn hảo với đồ họa 3D, xử lý hình ảnh và machine learning.

### 1.1 Streaming Multiprocessor (SM)

Đơn vị cơ bản của kiến trúc NVIDIA là **Streaming Multiprocessor (SM)**. Mỗi GPU chứa từ vài chục đến hơn một trăm SM, tùy thuộc vào kích thước chip và phân khúc sản phẩm.

Mỗi SM bao gồm:

- **CUDA cores**: Thực hiện các phép tính dấu phẩy động và số nguyên. Đây là lõi xử lý đa năng nhất của GPU.
- **Tensor cores**: Chuyên tối ưu phép nhân ma trận, cực kỳ quan trọng cho AI/ML và DLSS.
- **RT cores**: Xử lý tia sáng trong ray tracing, tăng tốc độ tính toán giao điểm tia-tam giác.
- **Warp schedulers**: Điều phối nhóm 32 luồng (một warp) thực thi đồng thởi.
- **Register file và shared memory**: Bộ nhớ nhanh bên trong SM để lưu trữ dữ liệu tạm thởi.

Số lượng SM quyết định trực tiếp đến khả năng tính toán song song của GPU. Ví dụ, RTX 4090 dựa trên AD102 có 128 SM, trong khi RTX 4060 dùng AD107 chỉ có 24 SM.

### 1.2 CUDA Cores — Trái Tim Tính Toán

**CUDA cores** là các lõi xử lý đa năng, có thể thực hiện cả phép tính dấu phẩy động (FP32) và số nguyên (INT32). Kể từ Ampere, NVIDIA tách riêng đường dữ liệu FP32 và INT32, cho phép thực thi đồng thởi cả hai loại phép toán trong cùng một chu kỳ đồng hồ.

Tuy nhiên, số lượng CUDA cores không phải lúc nào cũng tỉ lệ thuận với hiệu năng thực tế. Kiến trúc, tần số xung nhịp, băng thông bộ nhớ và hiệu quả của từng thế hệ đều ảnh hưởng đến kết quả cuối cùng.

### 1.3 Tensor Cores — Tăng Tốc AI

**Tensor cores** là các đơn vị chuyên dụng cho phép nhân ma trận, hoạt động theo định dạng mixed-precision như FP16, BF16, INT8 và INT4. Chúng là nền tảng cho:

- **DLSS (Deep Learning Super Sampling)**: Tái tạo khung hình độ phân giải cao từ dữ liệu độ phân giải thấp hơn.
- **Frame Generation**: Tạo thêm khung hình giữa hai khung hình thật bằng AI.
- **AI workload**: Huấn luyện và inference các mô hình deep learning.

Từ thế hệ Ampere, Tensor cores hỗ trợ **sparsity** (tính thưa), cho phép bỏ qua các phép tính với giá trị zero để tăng gấp đôi thông lượng lý thuyết trong một số trường hợp.

### 1.4 RT Cores — Ray Tracing Phần Cứng

**RT cores** xử lý các phép tính **Bounding Volume Hierarchy (BVH)** traversal và giao điểm tia-tam giác. Thay vì dùng CUDA cores để tính toán từng tia sáng (vốn rất chậm), RT cores giúp tăng tốc đáng kể quá trình ray tracing.

Qua các thế hệ:

- **Turing (RTX 20 series)**: RT core thế hệ đầu tiên, xử lý 1 giao điểm tia/tam giác mỗi chu kỳ.
- **Ampere (RTX 30 series)**: RT core thế hệ 2 với khả năng xử lý đồng thởi nhiều tia hơn và hỗ trợ motion blur.
- **Ada Lovelace (RTX 40 series)**: RT core thế hệ 3 với **Opacity Micromap** và **Displaced Micro-Mesh**, giúp giảm số lượng hình học cần tính toán.
- **Blackwell (RTX 50 series)**: RT core thế hệ 4 tích hợp AI để tăng tốc ray tracing hơn nữa.

## 2. Bộ Nhớ và Băng Thông

Bộ nhớ là một trong những yếu tố quan trọng nhất quyết định hiệu năng GPU, đặc biệt trong các tác vụ độ phân giải cao và AI.

### 2.1 GDDR6 và GDDR6X

Hầu hết card đồ họa tiêu dùng của NVIDIA sử dụng **GDDR6** hoặc **GDDR6X**:

- **GDDR6**: Phổ biến trên RTX 20 series và RTX 30/40 series tầm trung. Băng thông tốt, tiêu thụ điện năng hợp lý.
- **GDDR6X**: Xuất hiện trên RTX 3080/3090 và RTX 4080/4090. Sử dụng **PAM4 signaling**, truyền 2 bit mỗi chu kỳ thay vì 1 bit như GDDR6, giúp tăng băng thông đáng kể.

Ví dụ, RTX 4090 có 24GB GDDR6X với băng thông lên đến 1,008 GB/s. Trong khi đó, RTX 4060 chỉ có 8GB GDDR6 với băng thông 272 GB/s — đây là một trong những lý do khiến 4060 gặp khó khăn ở độ phân giải cao hoặc các tác vụ nặng.

### 2.2 HBM — Dành Cho Datacenter

Các card dòng **A100**, **H100**, **H200** và **B200** sử dụng **HBM (High Bandwidth Memory)** thay vì GDDR. HBM xếp chip nhớ chồng lên nhau và kết nối trực tiếp với GPU qua một giao diện băng thông rộng, mang lại băng thông cực lớn.

Ví dụ:

- **H100 SXM5**: HBM3 với băng thông 3.35 TB/s.
- **B200**: HBM3e với băng thông lên đến 8 TB/s.

HBM tốn kém hơn GDDR nhưng cần thiết cho AI training với các mô hình lớn, nơi dữ liệu phải được di chuyển liên tục giữa bộ nhớ và compute units.

### 2.3 Cache Hierarchy

Ngoài bộ nhớ chính, GPU NVIDIA còn có nhiều cấp độ cache:

- **L1 cache**: Nằm trong mỗi SM, tốc độ rất cao, dung lượng nhỏ.
- **L2 cache**: Chia sẻ toàn cục, lớn hơn L1 rất nhiều. Ada Lovelace tăng đáng kể L2 cache — ví dụ AD102 có 72MB L2, gấp nhiều lần GA102 chỉ có 6MB.
- **L0 texture cache**: Chuyên dụng cho việc lấy mẫu texture.

Việc tăng L2 cache giúp giảm số lần truy cập bộ nhớ chậm hơn, cải thiện hiệu năng đặc biệt trong ray tracing và các tác vụ có tính locality cao.

## 3. Quy Trình Sản Xuất Và Tiến Trình

Kích thước tiến trình (process node) ảnh hưởng trực tiếp đến mật độ transistor, tiêu thụ điện năng và nhiệt độ.

| Thế hệ | Kiến trúc | Node | Điển hình |
|--------|-----------|------|----------|
| RTX 20 | Turing | 12nm TSMC | RTX 2080 Ti |
| RTX 30 | Ampere | 8nm Samsung / 7nm TSMC | RTX 3090, A100 |
| RTX 40 | Ada Lovelace | 4nm TSMC | RTX 4090 |
| RTX 50 | Blackwell | 4nm TSMC | RTX 5090 |
| Datacenter | Blackwell | 4nm TSMC | B200 |

### 3.1 Mật Độ Transistor

Tiến trình càng nhỏ, càng nhiều transistor có thể nhét vào cùng một diện tích. RTX 4090 sử dụng chip AD102 với khoảng 76.3 tỷ transistor trên diện tích 609 mm². So với GA102 của RTX 3090 Ti (28.3 tỷ transistor, 628 mm²), mật độ transistor tăng gấp hơn 2.5 lần.

### 3.2 Hiệu Suất Năng Lượng

Tiến trình nhỏ hơn giúp transistor chuyển mạch nhanh hơn và tốn ít năng lượng hơn. Đây là lý do tại sao RTX 4090 có thể đạt hiệu năng gấp 2-3 lần RTX 3090 Ti trong khi công suất tiêu thụ chỉ tăng từ 350W lên 450W.

## 4. Các Thế Hệ Kiến Trúc

### 4.1 Turing (2018) — Nền Tảng Ray Tracing Và DLSS

Turing là kiến trúc đầu tiên đưa **RT cores** và **Tensor cores** lên card đồ họa tiêu dùng. Mặc dù hiệu năng ray tracing còn hạn chế, Turing đã đặt nền móng cho hai công nghệ then chốt sau này.

Đặc điểm:

- CUDA cores hỗ trợ cả FP32 và INT32 đồng thởi.
- RT core thế hệ 1.
- Tensor core thế hệ 1, chủ yếu hỗ trợ FP16.
- Bộ nhớ GDDR6.

### 4.2 Ampere (2020) — Bước Nhảy Về Hiệu Năng

Ampere mang đến nhiều cải tiến lớn:

- **RT core thế hệ 2**: Ray tracing nhanh hơn đáng kể.
- **Tensor core thế hệ 3**: Hỗ trợ TF32, BF16 và sparsity.
- **CUDA cores thế hệ 2**: Tách biệt pipeline FP32 và INT32.
- **GDDR6X**: Băng thông bộ nhớ tăng cao.

Ampere cũng giới thiệu **DLSS 2.0**, sử dụng AI để upscale hình ảnh với chất lượng gần như native.

### 4.3 Ada Lovelace (2022) — Hiệu Năng Và Hiệu Quả

Ada Lovelace đại diện cho bước tiến lớn nhất về hiệu suất năng lượng:

- **SM thế hệ mới**: Shader Execution Reordering (SER) tối ưu thứ tự thực thi shader.
- **RT core thế hệ 3**: Hỗ trợ Opacity Micromap và Displaced Micro-Mesh.
- **Tensor core thế hệ 4**: Hiệu năng AI tăng vọt.
- **DLSS 3**: Frame Generation tạo khung hình mới bằng AI.
- **L2 cache khổng lồ**: Giảm bottleneck bộ nhớ.

### 4.4 Blackwell (2024-2025) — AI Lên Ngôi

Blackwell tập trung mạnh mẽ vào AI và ray tracing:

- **Tensor core thế hệ 5**: Hỗ trợ FP4 và FP6 precision, tăng tốc inference AI.
- **RT core thế hệ 4**: Tích hợp **Neural Rendering**.
- **DLSS 4**: Multi Frame Generation, tạo nhiều khung hình AI hơn.
- **HBM3e**: Băng thông cực lớn cho datacenter.

## 5. Chỉ Số Hiệu Năng Và Cách Đánh Giá

### 5.1 TFLOPS

**TFLOPS** đo số phép tính dấu phẩy động thực hiện được mỗi giây. Đây là chỉ số lý thuyết, không phản ánh hoàn toàn hiệu năng thực tế vì phụ thuộc vào băng thông bộ nhớ, cache và khả năng tối ưu hóa của ứng dụng.

### 5.2 Tần Số Boost

Tần số boost là tần số xung nhịp tối đa GPU có thể đạt trong điều kiện tải. Tần số cao hơn đồng nghĩa với nhiều phép tính hơn mỗi giây, nhưng cũng đồng nghĩa với nhiệt và điện năng tiêu thụ cao hơn.

### 5.3 TDP (Thermal Design Power)

TDP cho biết mức nhiệt và điện năng tối đa GPU được thiết kế để xử lý. Các card cao cấp như RTX 4090 có TDP 450W, yêu cầu hệ thống tản nhiệt và nguồn điện mạnh. Trong khi RTX 4060 chỉ có TDP 115W, phù hợp với build nhỏ gọn.

### 5.4 Memory Bandwidth

Băng thông bộ nhớ quyết định tốc độ GPU có thể đọc/ghi dữ liệu từ VRAM. Các tác vụ độ phân giải cao (4K), texture lớn và AI model lớn đều đòi hỏi băng thông lớn.

## 6. Tối Ưu Nhiệt Và Điện Năng

### 6.1 Dynamic Boost

NVIDIA **Dynamic Boost** tự động phân bổ công suất giữa GPU và CPU trong laptop, tăng hiệu năng GPU khi CPU không tải nặng.

### 6.2 Resizable BAR

**Resizable BAR** cho phép CPU truy cập toàn bộ VRAM của GPU cùng một lúc thay vì từng khối 256MB. Điều này giảm bottleneck và cải thiện hiệu năng trong một số game.

### 6.3 Tản Nhiệt

Các card cao cấp sử dụng tản nhiệt khổng lồ với nhiều heatpipe, vapor chamber và quạt lớn. RTX 4090 Founders Edition sử dụng thiết kế dual-axial flow-through với heatsandwich, giúp duy trì nhiệt độ ổn định dưới tải nặng.

## 7. Ứng Dụng Thực Tế

### 7.1 Gaming

Trong gaming, hiệu năng GPU phụ thuộc vào:

- Số lượng CUDA cores và tần số
- Băng thông bộ nhớ
- Khả năng ray tracing và DLSS
- Độ phân giải mục tiêu

### 7.2 AI Và Machine Learning

Các card RTX và đặc biệt là dòng datacenter A100/H100/B200 được tối ưu cho:

- Training mô hình neural network
- Inference với TensorRT
- Xử lý ngôn ngữ tự nhiên (NLP)
- Computer vision
- Generative AI

### 7.3 Đồ Họa Và Render

CUDA cores và OptiX giúp tăng tốc render trong Blender, Maya, 3ds Max. RT cores cải thiện ray tracing trong V-Ray, Octane và Unreal Engine.

## 8. Kết Luận

Card đồ họa NVIDIA là kết quả của hàng thập kỷ tích lũy kiến trúc, từ CUDA cores đơn giản đến các SM phức tạp với RT cores và Tensor cores. Mỗi thế hệ kiến trúc không chỉ tăng số lượng transistor mà còn cải thiện cách GPU xử lý dữ liệu, tối ưu năng lượng và mở rộng khả năng AI.

Khi chọn card đồ họa, đừng chỉ nhìn vào số CUDA cores hay VRAM. Hãy xem xét tổng thể: kiến trúc, băng thông bộ nhớ, cache, TDP và mục đích sử dụng. Một RTX 4060 có thể đủ cho gaming 1080p, nhưng với AI training hay render 4K, bạn sẽ cần đến RTX 4080/4090 hoặc thậm chí là dòng datacenter H100/B200.


