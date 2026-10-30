import { PrismaClient, Role, DocumentStatus, QuizDifficulty, SummaryType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for SmartDoc...');

  // Hash password
  const saltRounds = 10;
  const adminPassword = await bcrypt.hash('Admin@123456', saltRounds);
  const teacherPassword = await bcrypt.hash('Teacher@123456', saltRounds);
  const studentPassword = await bcrypt.hash('Student@123456', saltRounds);

  // 1. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@smartdoc.edu.vn' },
    update: {},
    create: {
      email: 'admin@smartdoc.edu.vn',
      fullName: 'Quản trị viên Hệ thống (Admin)',
      password: adminPassword,
      role: Role.ADMIN,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@smartdoc.edu.vn' },
    update: {},
    create: {
      email: 'teacher@smartdoc.edu.vn',
      fullName: 'ThS. Nguyễn Văn Giảng Viên',
      password: teacherPassword,
      role: Role.TEACHER,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const student = await prisma.user.upsert({
    where: { email: 'student@smartdoc.edu.vn' },
    update: {},
    create: {
      email: 'student@smartdoc.edu.vn',
      fullName: 'Trần Văn Sinh Viên',
      password: studentPassword,
      role: Role.STUDENT,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  console.log('✅ Users seeded successfully:');
  console.log('   - Admin: admin@smartdoc.edu.vn / Admin@123456');
  console.log('   - Teacher: teacher@smartdoc.edu.vn / Teacher@123456');
  console.log('   - Student: student@smartdoc.edu.vn / Student@123456');

  // 2. Seed Categories
  const categoriesData = [
    { name: 'Cấu trúc dữ liệu & Giải thuật', slug: 'data-structures-algorithms', description: 'Các tài liệu, bài giảng về cây, đồ thị, thuật toán sắp xếp và tìm kiếm.' },
    { name: 'Trí tuệ nhân tạo & Machine Learning', slug: 'ai-machine-learning', description: 'Nhập môn AI, Deep Learning, NLP và các mô hình ngôn ngữ lớn (LLM).' },
    { name: 'Lập trình Web & Hệ thống phân tán', slug: 'web-development-cloud', description: 'Phát triển Full-Stack hiện đại với React, Node.js, Docker, Cloud.' },
    { name: 'Cơ sở dữ liệu & Phân tích dữ liệu', slug: 'databases-analytics', description: 'SQL, NoSQL, Vector DBs, Data Warehouse và Big Data.' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(c);
  }
  console.log(`✅ Categories seeded: ${categories.length}`);

  // 3. Seed Course
  const course = await prisma.course.upsert({
    where: { code: 'CS201-DSA' },
    update: {},
    create: {
      code: 'CS201-DSA',
      title: 'Cấu trúc dữ liệu & Giải thuật nâng cao (DSA)',
      description: 'Môn học cốt lõi ngành CNTT bao gồm Cây nhị phân, AVL, B-Tree, Đồ thị Dijkstra, Quick Sort và RAG AI.',
      teacherId: teacher.id,
      categoryId: categories[0].id,
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc141e6c382?w=600',
    },
  });

  // 4. Seed Document
  const document = await prisma.document.upsert({
    where: { id: 'doc-dsa-demo-001' },
    update: {},
    create: {
      id: 'doc-dsa-demo-001',
      title: 'Giáo trình Cấu trúc dữ liệu và Giải thuật (DSA Guide)',
      description: 'Tổng hợp chi tiết về Danh sách liên kết, Ngăn xếp, Hàng đợi, Cây tìm kiếm nhị phân và các thuật toán sắp xếp kinh điển.',
      fileUrl: 'https://res.cloudinary.com/demo/image/upload/v1680000000/sample_dsa.pdf',
      fileType: 'application/pdf',
      fileSize: 2450800,
      pageCount: 35,
      status: DocumentStatus.READY,
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      courseId: course.id,
      categoryId: categories[0].id,
      uploadedById: teacher.id,
      viewCount: 142,
      downloadCount: 48,
    },
  });

  // 5. Seed Document Chunks (for demo search & RAG)
  await prisma.documentChunk.deleteMany({ where: { documentId: document.id } });
  await prisma.documentChunk.createMany({
    data: [
      {
        documentId: document.id,
        chunkIndex: 0,
        pageNumber: 1,
        content: 'Chương 1: Tổng quan về Cấu trúc dữ liệu. Cấu trúc dữ liệu là cách tổ chức và lưu trữ dữ liệu trong máy tính sao cho có thể truy cập và sửa đổi một cách hiệu quả. Phân loại chính gồm Cấu trúc tuyến tính (Mảng, Danh sách liên kết, Stack, Queue) và Phi tuyến tính (Cây, Đồ thị).',
        metadata: { chapter: 'Chương 1', topic: 'Tổng quan' },
      },
      {
        documentId: document.id,
        chunkIndex: 1,
        pageNumber: 5,
        content: 'Chương 2: Cây tìm kiếm nhị phân (Binary Search Tree - BST). Cây nhị phân là cây mà mỗi nút có tối đa 2 nút con (con trái và con phải). Tính chất đặc trưng của BST: Tất cả các khóa ở cây con bên trái đều nhỏ hơn khóa tại nút gốc, và tất cả các khóa ở cây con bên phải đều lớn hơn khóa tại nút gốc. Độ phức tạp tìm kiếm trung bình là O(log N).',
        metadata: { chapter: 'Chương 2', topic: 'Binary Search Tree' },
      },
      {
        documentId: document.id,
        chunkIndex: 2,
        pageNumber: 12,
        content: 'Chương 3: Thuật toán Sắp xếp nhanh (Quick Sort). Quick Sort là thuật toán sắp xếp dựa trên nguyên lý Chia để trị (Divide and Conquer). Thuật toán chọn một phần tử làm điểm chốt (Pivot), sau đó phân hoạch mảng sao cho các phần tử nhỏ hơn pivot đứng trước và lớn hơn đứng sau. Sau đó đệ quy sắp xếp hai mảng con. Độ phức tạp trung bình O(N log N), trường hợp xấu nhất O(N^2).',
        metadata: { chapter: 'Chương 3', topic: 'Quick Sort' },
      },
      {
        documentId: document.id,
        chunkIndex: 3,
        pageNumber: 20,
        content: 'Chương 4: Thuật toán Đồ thị Dijkstra. Tìm đường đi ngắn nhất từ một đỉnh nguồn đến tất cả các đỉnh còn lại trong đồ thị có trọng số không âm. Thuật toán sử dụng hàng đợi ưu tiên (Priority Queue) để liên tục chọn đỉnh có khoảng cách nhỏ nhất chưa được xét. Độ phức tạp với Fibonacci Heap là O(E + V log V).',
        metadata: { chapter: 'Chương 4', topic: 'Dijkstra Shortest Path' },
      },
    ],
  });

  // 6. Seed Summary
  await prisma.summary.deleteMany({ where: { documentId: document.id } });
  await prisma.summary.create({
    data: {
      documentId: document.id,
      userId: student.id,
      type: SummaryType.DETAILED,
      content: 'Tài liệu cung cấp nền tảng toàn diện về cấu trúc dữ liệu và giải thuật. Nội dung trọng tâm tập trung vào so sánh hiệu năng giữa mảng và danh sách liên kết, nguyên tắc cân bằng của cây BST/AVL, cũng như các chiến lược sắp xếp và tối ưu hóa đường đi trên đồ thị.',
      keyPoints: [
        'Cấu trúc dữ liệu tuyến tính vs phi tuyến tính và ứng dụng tương ứng',
        'Cây BST có tính chất khóa trái < gốc < phải, tìm kiếm O(log N)',
        'Quick Sort dùng kỹ thuật Chia để trị với điểm chốt (Pivot)',
        'Dijkstra áp dụng hàng đợi ưu tiên cho đồ thị trọng số không âm',
      ],
      importantTerms: [
        { term: 'Binary Search Tree (BST)', definition: 'Cây nhị phân có khóa nút con trái luôn nhỏ hơn nút cha và nút con phải luôn lớn hơn nút cha.' },
        { term: 'Divide and Conquer', definition: 'Chiến lược chia bài toán lớn thành các bài toán con tương tự, giải quyết độc lập rồi gộp kết quả.' },
        { term: 'Pivot (Điểm chốt)', definition: 'Phần tử được chọn trong Quick Sort để phân hoạch mảng thành 2 nửa.' },
      ],
    },
  });

  // 7. Seed Quiz
  const quiz = await prisma.quiz.create({
    data: {
      title: 'Kiểm tra trắc nghiệm: Cấu trúc dữ liệu & Thuật toán cơ bản',
      description: 'Bộ câu hỏi đánh giá kiến thức về BST, Quick Sort và Đồ thị.',
      difficulty: QuizDifficulty.MEDIUM,
      documentId: document.id,
      courseId: course.id,
      createdById: teacher.id,
      questions: {
        create: [
          {
            question: 'Độ phức tạp thời gian trung bình của thuật toán Quick Sort là bao nhiêu?',
            options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(log N)'],
            correctAnswer: 1,
            explanation: 'Trong trường hợp trung bình, việc chọn pivot hợp lý chia mảng làm hai nửa cân bằng, dẫn đến độ phức tạp O(N log N).',
          },
          {
            question: 'Trong cây tìm kiếm nhị phân (BST), điều kiện nào sau đây là đúng?',
            options: [
              'Khóa con trái luôn lớn hơn nút gốc',
              'Khóa con trái nhỏ hơn gốc và khóa con phải lớn hơn gốc',
              'Cả hai con trái và phải đều nhỏ hơn gốc',
              'Không có ràng buộc về giá trị của các khóa',
            ],
            correctAnswer: 1,
            explanation: 'Theo định nghĩa BST, toàn bộ cây con bên trái có giá trị nhỏ hơn nút gốc, và cây con bên phải có giá trị lớn hơn.',
          },
          {
            question: 'Thuật toán Dijkstra không áp dụng được cho loại đồ thị nào?',
            options: [
              'Đồ thị có chu trình',
              'Đồ thị vô hướng',
              'Đồ thị có cạnh mang trọng số âm',
              'Đồ thị liên thông',
            ],
            correctAnswer: 2,
            explanation: 'Dijkstra giả định rằng việc đi thêm cạnh sẽ không làm giảm chi phí đã tính, do đó không chạy đúng với trọng số âm (phải dùng Bellman-Ford).',
          },
        ],
      },
    },
  });

  // 8. Seed Flashcards
  const deck = await prisma.flashcardDeck.create({
    data: {
      title: 'Flashcard Trọng Tâm DSA',
      description: 'Ghi nhớ các khái niệm cốt lõi Cây nhị phân và Thuật toán sắp xếp.',
      documentId: document.id,
      userId: student.id,
      cards: {
        create: [
          {
            front: 'Cây tìm kiếm nhị phân (BST) là gì?',
            back: 'Là cây nhị phân thỏa mãn: Mọi nút con bên trái có khóa < gốc, mọi nút con bên phải có khóa > gốc.',
            order: 1,
          },
          {
            front: 'Trường hợp xấu nhất của Quick Sort xảy ra khi nào? Độ phức tạp là gì?',
            back: 'Xảy ra khi Pivot liên tục là phần tử lớn nhất hoặc nhỏ nhất (ví dụ mảng đã sắp xếp sẵn). Độ phức tạp là O(N^2).',
            order: 2,
          },
          {
            front: 'Nguyên lý hoạt động của Stack là gì?',
            back: 'LIFO (Last In First Out) - Phần tử nào vào sau cùng sẽ được lấy ra đầu tiên.',
            order: 3,
          },
        ],
      },
    },
  });

  // 9. Seed Mindmap
  await prisma.mindmap.create({
    data: {
      title: 'Sơ đồ tư duy Cấu trúc Dữ liệu & Giải thuật',
      documentId: document.id,
      userId: student.id,
      treeData: {
        id: 'root',
        label: 'Cấu Trúc Dữ Liệu & Giải Thuật',
        children: [
          {
            id: 'node-linear',
            label: 'Cấu trúc tuyến tính',
            children: [
              { id: 'node-array', label: 'Array (Mảng tĩnh & động)' },
              { id: 'node-linked-list', label: 'Linked List (Đơn, Đôi, Vòng)' },
              { id: 'node-stack', label: 'Stack (LIFO)' },
              { id: 'node-queue', label: 'Queue (FIFO & Priority)' },
            ],
          },
          {
            id: 'node-non-linear',
            label: 'Cấu trúc phi tuyến tính',
            children: [
              {
                id: 'node-tree',
                label: 'Cây (Tree)',
                children: [
                  { id: 'node-bst', label: 'Binary Search Tree (BST)' },
                  { id: 'node-avl', label: 'AVL & Red-Black Tree' },
                ],
              },
              {
                id: 'node-graph',
                label: 'Đồ thị (Graph)',
                children: [
                  { id: 'node-bfs-dfs', label: 'Duyệt BFS / DFS' },
                  { id: 'node-dijkstra', label: 'Đường đi ngắn nhất Dijkstra' },
                ],
              },
            ],
          },
          {
            id: 'node-sort',
            label: 'Thuật toán sắp xếp',
            children: [
              { id: 'node-quicksort', label: 'Quick Sort (O(N log N))' },
              { id: 'node-mergesort', label: 'Merge Sort' },
              { id: 'node-heapsort', label: 'Heap Sort' },
            ],
          },
        ],
      },
    },
  });

  // 10. Seed Study Plan
  await prisma.studyPlan.create({
    data: {
      userId: student.id,
      subject: 'Ôn tập Đồ án & Thi kết thúc môn DSA',
      examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days later
      targetScore: 'A (8.5 - 10.0)',
      availableHoursPerDay: 2.5,
      currentLevel: 'Trung bình khá',
      planData: [
        {
          day: 1,
          topic: 'Ôn tập Mảng & Danh sách liên kết',
          tasks: ['Đọc lại tài liệu chương 1', 'Giải 3 bài toán LeetCode về Reverse Linked List', 'Tự kiểm tra Flashcards'],
          completed: true,
        },
        {
          day: 2,
          topic: 'Stack & Queue trong bài toán thực tế',
          tasks: ['Ứng dụng kiểm tra ngoặc hợp lệ bằng Stack', 'Hiện thực Queue bằng 2 Stack'],
          completed: true,
        },
        {
          day: 3,
          topic: 'Cây tìm kiếm nhị phân (BST)',
          tasks: ['Học tính chất BST & thao tác chèn/xóa nút', 'Làm Quiz trắc nghiệm trên SmartDoc'],
          completed: false,
        },
        {
          day: 4,
          topic: 'Thuật toán sắp xếp: Quick Sort & Merge Sort',
          tasks: ['Phân tích thuật toán phân hoạch Lomuto/Hoare', 'So sánh độ phức tạp không gian'],
          completed: false,
        },
        {
          day: 5,
          topic: 'Đồ thị & Thuật toán Dijkstra',
          tasks: ['Đọc chương 4 tài liệu DSA', 'Thực hành giải thuật Dijkstra từng bước bằng tay'],
          completed: false,
        },
      ],
    },
  });

  // 11. Seed Learning Analytics
  await prisma.learningAnalytics.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      totalStudyMinutes: 380,
      quizzesTaken: 5,
      averageQuizScore: 8.2,
      flashcardsReviewed: 45,
      documentsViewed: 12,
      strongTopics: ['Danh sách liên kết', 'Stack & Queue', 'Quick Sort'],
      weakTopics: ['Đồ thị Dijkstra', 'Cây cân bằng AVL'],
      aiRecommendation: 'Bạn đang nắm rất chắc các cấu trúc dữ liệu tuyến tính và Quick Sort! Tuy nhiên bạn còn nhầm lẫn về điều kiện trọng số âm của thuật toán Dijkstra. Khuyến nghị: Ôn tập lại Chương 4 của tài liệu DSA và làm lại Quiz về Đồ thị để cải thiện điểm số.',
    },
  });

  // 12. Seed Chat Session & Messages
  const chatSession = await prisma.chatSession.create({
    data: {
      title: 'Hỏi đáp về Thuật toán Quick Sort',
      userId: student.id,
      documentId: document.id,
      messages: {
        create: [
          {
            role: 'user',
            content: 'Quick Sort hoạt động như thế nào và độ phức tạp là bao nhiêu?',
          },
          {
            role: 'assistant',
            content: 'Chào bạn! Theo tài liệu **Giáo trình Cấu trúc dữ liệu và Giải thuật (DSA Guide)** tại **Trang 12**:\n\n1. **Nguyên lý hoạt động**:\n   - Quick Sort hoạt động dựa trên chiến lược **Chia để trị (Divide and Conquer)**.\n   - Thuật toán chọn một phần tử trong mảng làm điểm chốt (**Pivot**).\n   - Tiến hành phân hoạch (partitioning) mảng sao cho các phần tử nhỏ hơn pivot nằm ở bên trái, các phần tử lớn hơn pivot nằm ở bên phải.\n   - Sau đó tiếp tục đệ quy sắp xếp hai mảng con trái và phải.\n\n2. **Độ phức tạp thời gian**:\n   - **Trung bình**: `O(N log N)` khi pivot chia mảng tương đối đồng đều.\n   - **Trường hợp xấu nhất**: `O(N^2)` khi mảng đã sắp xếp và chọn pivot ở đầu hoặc cuối mảng.',
            sources: [
              {
                documentId: document.id,
                documentName: 'Giáo trình Cấu trúc dữ liệu và Giải thuật (DSA Guide)',
                pageNumber: 12,
                contentSnippet: 'Chương 3: Thuật toán Sắp xếp nhanh (Quick Sort)...',
              },
            ],
          },
        ],
      },
    },
  });

  // 13. Seed Notification
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: 'Tài liệu mới đã sẵn sàng!',
        message: 'Tài liệu "Giáo trình Cấu trúc dữ liệu và Giải thuật" đã được AI xử lý trích xuất xong và sẵn sàng cho RAG Chat.',
        type: 'AI_READY',
        link: `/documents/${document.id}`,
      },
      {
        userId: student.id,
        title: 'Lời khuyên học tập từ AI',
        message: 'SmartDoc nhận thấy bạn đang cần củng cố kiến thức về Đồ thị. Hãy xem lại chương 4 nhé!',
        type: 'INFO',
        link: '/analytics',
      },
    ],
  });

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
