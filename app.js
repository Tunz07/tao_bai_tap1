document.addEventListener("DOMContentLoaded", () => {
  const titleInput = document.getElementById("titleInput");
  const topicInput = document.getElementById("topicInput");
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewContainer = document.getElementById(
    "imagePreviewContainer",
  );
  const fileName = document.getElementById("fileName");
  const addBtn = document.getElementById("addBtn");
  const exerciseList = document.getElementById("exerciseList");
  const topicFilter = document.getElementById("topicFilter");

  let currentImageData = "";

  // Lấy danh sách bài tập từ LocalStorage
  function getExercises() {
    const stored = localStorage.getItem("web_exercises");
    return stored ? JSON.parse(stored) : [];
  }

  // Lưu danh sách bài tập vào LocalStorage
  function saveExercises(exercises) {
    localStorage.setItem("web_exercises", JSON.stringify(exercises));
  }

  // Đọc ảnh và xem trước
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fileName.textContent = file.name;
      const reader = new FileReader();
      reader.onload = function (evt) {
        currentImageData = evt.target.result;
        imagePreview.src = currentImageData;
        imagePreviewContainer.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });

  // Thêm bài tập
  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    const topic = topicInput.value.trim() || "Chưa phân loại";

    if (!title || !currentImageData) {
      alert("Vui lòng nhập tên bài tập và chọn ảnh!");
      return;
    }

    const newExercise = {
      id: Date.now().toString(),
      title,
      topic,
      imageData: currentImageData,
      createdAt: new Date().toLocaleDateString("vi-VN"),
    };

    const exercises = getExercises();
    exercises.unshift(newExercise);
    saveExercises(exercises);

    // Reset form
    titleInput.value = "";
    topicInput.value = "";
    imageInput.value = "";
    fileName.textContent = "Chưa chọn ảnh";
    imagePreviewContainer.classList.add("hidden");
    currentImageData = "";

    updateApp();
  });

  // Lọc theo chủ đề
  topicFilter.addEventListener("change", () => {
    renderExercises(getExercises());
  });

  // Cập nhật danh sách chủ đề
  function updateTopicOptions(exercises) {
    const topics = Array.from(new Set(exercises.map((e) => e.topic)));
    const currentSelected = topicFilter.value;

    topicFilter.innerHTML = '<option value="ALL">Tất cả chủ đề</option>';
    topics.forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      topicFilter.appendChild(opt);
    });

    topicFilter.value = topics.includes(currentSelected)
      ? currentSelected
      : "ALL";
  }

  // Hiển thị danh sách bài tập
  function renderExercises(exercises) {
    const selectedTopic = topicFilter.value;
    const filtered =
      selectedTopic === "ALL"
        ? exercises
        : exercises.filter((e) => e.topic === selectedTopic);

    exerciseList.innerHTML = "";

    if (filtered.length === 0) {
      exerciseList.innerHTML =
        '<p style="grid-column: 1/-1; text-align:center; color:#888;">Chưa có bài tập nào.</p>';
      return;
    }

    filtered.forEach((ex) => {
      const card = document.createElement("div");
      card.className = "exercise-card";
      card.innerHTML = `
                <div>
                    <span class="badge">${escapeHtml(ex.topic)}</span>
                    <h3 class="exercise-title">${escapeHtml(ex.title)}</h3>
                    <img src="${ex.imageData}" class="exercise-img" alt="${escapeHtml(ex.title)}" />
                </div>
                <button class="btn btn-danger" onclick="deleteExercise('${ex.id}')">Xóa bài này</button>
            `;
      exerciseList.appendChild(card);
    });
  }

  // Xóa bài tập
  window.deleteExercise = function (id) {
    let exercises = getExercises();
    exercises = exercises.filter((e) => e.id !== id);
    saveExercises(exercises);
    updateApp();
  };

  function updateApp() {
    const exercises = getExercises();
    updateTopicOptions(exercises);
    renderExercises(exercises);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Chạy khi mở trang
  updateApp();
});
