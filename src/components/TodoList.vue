<template>
  <div class="container my-3 col-md-4">
    <div class="text-center">
      <div class="card-header bg-custom-1">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item" v-for="tab in headerTabs" :key="tab.name">
            <a
              class="nav-link text-costom"
              href="#"
              :class="{ active: visibilityTab == tab.value }"
              @click="visibilityTab = tab.value"
              >{{ tab.name }}</a
            >
          </li>
          <button class="btn ms-5">
            <i
              class="bi"
              @click="toggleSort"
              :class="[
                sortDirection > 0 ? 'bi-sort-down' : 'bi-sort-up',
                todoStore.sortToggle ? 'text-primary' : '',
              ]"
            ></i>
          </button>
        </ul>
      </div>
      <div class="card-list p-3 bg-custom card-list-scroll">
        <draggable
          class="d-flex flex-column gap-2"
          v-model="todoStore.todos"
          handle=".drag-handle"
          item-key="id"
          tag="div"
          @change="updateSort"
        >
          <template #item="{ element: item }">
            <div
              class="card-flash card-hover shadow-sm rounded-3"
              v-if="showItem(item)"
              :class="[item.starred ? 'starred' : 'bg-white']"
            >
              <div
                class="card-body d-flex align-items-center px-1 position-relative"
              >
                <i
                  class="bi bi-three-dots-vertical drag-handle me-2"
                  style="cursor: move"
                ></i>
                <div class="form-check d-flex align-items-center flex-grow-1">
                  <input
                    type="checkbox"
                    class="form-check-input form-check-custom me-2"
                    :id="item.id"
                    v-model="item.completed"
                  />
                  <div class="d-flex flex-column justify-content-center">
                    <label
                      class="form-check-label d-flex align-items-center ms-2"
                      :for="item.id"
                    >
                      <h6
                        class="card-title my-2"
                        :class="{ completed: item.completed }"
                      >
                        {{ item.taskName }}
                      </h6>
                    </label>
                    <div
                      class="d-flex gap-2 text-muted align-items-center position-absolute end-1 bottom-0 ms-2 mb-1"
                      style="font-size: 0.84rem"
                      v-if="
                        item.deadline ||
                        (isExpired(item.deadline) && !item.completed)
                      "
                    >
                      <span
                        v-if="isExpired(item.deadline) && !item.completed"
                        class="badge rounded-pill bg-secondary"
                        >已過期</span
                      >
                      <span
                        :class="{
                          'text-danger':
                            isExpired(item.deadline) & !item.completed,
                        }"
                      >
                        <i class="bi bi-calendar-week" v-if="item.deadline"></i>
                        {{ formatDate(item.deadline) }}
                      </span>
                      <i
                        class="bi bi-chat-dots"
                        v-if="item.comment"
                        @click="toggleComment(item.id)"
                        style="cursor: pointer"
                        :class="{ 'text-primary': item.id === showCommentId }"
                      ></i>
                    </div>
                  </div>
                </div>
                <div class="btn-group btn-group-sm">
                  <button class="btn" @click="todoStore.toggleStar(item.id)">
                    <i
                      class="bi bi-star-fill text-warning"
                      v-if="item.starred"
                    ></i>
                    <i class="bi bi-star" v-else></i>
                  </button>
                  <button class="btn" @click="openEditDialog(item)">
                    <i
                      class="bi bi-pencil-fill text-primary"
                      v-if="item.id === editData.id"
                    ></i>
                    <i class="bi bi-pencil-fill" v-else></i>
                  </button>
                  <button class="btn" @click="deleteTask(item)">
                    <i class="bi bi-trash3"></i>
                  </button>
                </div>
              </div>

              <transition name="accordion">
                <div
                  class="ms-4 me-2 pt-1 pb-2"
                  v-if="showCommentId === item.id"
                >
                  <textarea
                    class="form-control"
                    rows="2"
                    v-model="item.comment"
                    disabled
                  ></textarea>
                </div>
              </transition>
            </div>
          </template>
        </draggable>
      </div>

      <div
        class="card-footer d-flex justify-content-between bg-custom-1 text-costom"
      >
        <span>{{ uncompletedPrompt }}</span>
        <a href="#" @click.prevent="deleteAllTask()">清除所有任務</a>
      </div>
    </div>
  </div>

  <div
    class="modal fade show d-block"
    tabindex="-1"
    role="dialog"
    style="z-index: 15"
    v-if="isEdit"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-custom">
          <h5 class="modal-title">編輯待辦事項</h5>
          <button type="button" class="btn-close" @click="closeDialog"></button>
        </div>
        <div class="modal-body text-start">
          <div>
            任務名稱
            <input
              type="text"
              class="form-control mb-3"
              v-model="editData.text"
            />
          </div>
          <div>
            截止日期
            <flat-pickr
              class="form-control mb-3"
              v-model="editData.deadline"
              :config="{ enableTime: true }"
            />
          </div>
          <div>
            備註
            <textarea class="form-control" v-model="editData.comment" row="3">
            </textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" @click="closeDialog">取消</button>
          <button class="btn btn-highlight" @click="updateDialogEdit">
            儲存
          </button>
        </div>
      </div>
    </div>
  </div>
  <div
    class="modal-backdrop fade show"
    style="z-index: 10"
    v-if="isEdit"
    @click="closeDialog"
  ></div>
</template>
<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useTodoStore } from "../stores/todo.js";
import draggable from "vuedraggable";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.min.css";

const todoStore = useTodoStore();
// console.log(todoStore);
// console.log(todoStore.todos);

let sortToggle = todoStore.sortToggle;

const props = defineProps({
  todos: {
    type: Array,
    default: [],
  },
});

const headerTabs = [
  {
    name: "全部",
    value: "allItem",
  },
  {
    name: "進行中",
    value: "processing",
  },
  {
    name: "已完成",
    value: "done",
  },
  {
    name: "最愛",
    value: "favorite",
  },
];
const visibilityTab = ref(headerTabs[0].value);
const isEdit = ref(false);
const sortDirection = ref(1); // 1: 升序, -1: 降序
const showCommentId = ref(null);

let editData = reactive({
  id: null,
  text: "",
  deadline: null,
  comment: "",
});

const deleteTask = (task) => {
  let removeIndex = props.todos.findIndex((item) => {
    return item.id === task.id;
  });
  todoStore.deleteTask(removeIndex);
};
const deleteAllTask = () => {
  todoStore.deleteAllTask();
};

const openEditDialog = (task) => {
  isEdit.value = true;
  editData = {
    id: task.id,
    text: task.taskName,
    deadline: task.deadline || null,
    comment: task.comment || "",
  };
};
function closeDialog() {
  isEdit.value = false;
  editData = {};
}
function updateDialogEdit() {
  todoStore.updateTask(editData.id, editData);
  isEdit.value = false;
  editData = {};
}
const showItem = (item) => {
  if (visibilityTab.value === "allItem") return true;
  if (visibilityTab.value === "processing") return !item.completed;
  if (visibilityTab.value === "done") return item.completed;
  if (visibilityTab.value === "favorite") return item.starred;
};

function isExpired(time) {
  if (!time) return false;
  return new Date(time) < new Date();
}
const formatDate = (time) => {
  if (!time) return "";
  const d = new Date(time);
  // const pad = (n) => n.toString().padStart(2, "0");
  const yy = d.getFullYear();
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  return yy + "/" + mm + "/" + dd;
};

const toggleSort = () => {
  todoStore.sortToggle = true;
  sortDirection.value *= -1;
  todoStore.todos.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // deadline 排序（有 deadline > 沒有 deadline）
    const aHasDeadline = !!a.deadline;
    const bHasDeadline = !!b.deadline;

    if (aHasDeadline && !bHasDeadline) return -1;
    if (!aHasDeadline && bHasDeadline) return 1;

    // deadline 時間先後
    if (aHasDeadline && bHasDeadline) {
      return (
        (new Date(a.deadline) - new Date(b.deadline)) * sortDirection.value
      );
    }
  });
};
const updateSort = () => {
  todoStore.sortToggle = false;
};

const toggleComment = (id) => {
  showCommentId.value = showCommentId.value === id ? null : id;
};
const filteredList = computed(() => {
  return;
  let allTab = headerTabs[0].value;
  let processingTab = headerTabs[1].value;
  let todoList = props.todos;
  // console.log(visibilityTab.value);

  if (visibilityTab.value === allTab) {
    return todoList;
  } else if (visibilityTab.value === processingTab) {
    return todoList.filter((item) => {
      return !item.completed;
    });
  } else {
    return todoList.filter((item) => {
      return item.completed;
    });
  }
});
const uncompletedPrompt = computed(() => {
  let message = "列表上沒有任務";
  let count = 0;
  let todoList = todoStore.todos;

  if (!todoList || todoList.length <= 0) {
    return message;
  }

  todoList.forEach((item) => {
    count = !item.completed ? count + 1 : count;
  });

  if (count > 0) {
    message = "還有 " + count + " 筆任務未完成";
  } else {
    message = "任務都完成了!";
  }

  return message;
});
</script>
<style scoped>
.card-list-scroll {
  max-height: 325px;
  overflow-y: auto;
  scroll-behavior: smooth;
  scrollbar-width: thin; /* Firefox */
  scrollbar-color: rgba(255, 255, 255, 0.7) transparent;
}

::v-deep(.card-list-scroll::-webkit-scrollbar) {
  width: 8px;
}
::v-deep(.card-list-scroll::-webkit-scrollbar-thumb) {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 6px;
  transition: background-color 0.3s;
}
::v-deep(.card-list-scroll::-webkit-scrollbar-thumb:hover) {
  background-color: rgba(255, 0, 0, 0.6);
}
.form-check-custom {
  width: 1.4rem;
  height: 1.4rem;
  /* margin-top: 1.2rem; */
  border-radius: 50%;
}

.completed {
  text-decoration: line-through;
}
.starred {
  background: lightyellow;
}
.text-costom {
  color: #4b5056;
}
.text-highlight {
  color: #ac7968;
}
.bg-custom {
  backdrop-filter: blur(8px);
  background: rgb(141, 172, 164, 0.5);
}
.bg-custom-1 {
  background: rgba(200, 209, 204, 1);
}
.bg-custom-2 {
  background: linear-gradient(to bottom, #f4b398, #f7cab6);
}
.btn-highlight {
  background: linear-gradient(to bottom, #fdac58, #ff8221);
}
.btn-cancel {
  background: linear-gradient(to bottom, #ccc, #8a8989);
}
.drag-handle:hover {
  color: #83b7cc;
}
.card-hover:hover {
  border-left: 4px solid #0d6efd;
}
.accordion-enter-active,
.accordion-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.accordion-enter-from,
.accordion-leave-to {
  max-height: 0;
  opacity: 0;
}

.accordion-enter-to,
.accordion-leave-from {
  max-height: 200px; /* 根據內容高度調整 */
  opacity: 1;
}
</style>