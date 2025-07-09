<template>
  <div class="container my-3">
    <div class="text-center">
      <div class="card-header">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item" v-for="tab in headerTabs" :key="tab.name">
            <a
              class="nav-link"
              href="#"
              :class="{ active: visibilityTab == tab.value }"
              @click="visibilityTab = tab.value"
              >{{ tab.name }}</a
            >
          </li>
          <button>
            <i
              class="bi me-1"
              @click="toggleSort"
              :class="[
                sortDirection > 0 ? 'bi-sort-down' : 'bi-sort-up',
                sortToggle ? 'text-primary' : '',
              ]"
            ></i>
          </button>
        </ul>
      </div>
      <ul class="list-group list-group-flush text-left">
        <draggable
          v-model="todoStore.todos"
          handle=".drag-handle"
          item-key="id"
          tag="div"
          @change="updateSort"
        >
          <template #item="{ element: item }">
            <li
              class="list-group-item"
              v-if="showItem(item)"
              :class="{ starred: item.starred }"
            >
              <div class="d-flex">
                <i
                  class="bi bi-three-dots-vertical drag-handle"
                  style="cursor: move"
                ></i>
                <div class="form-check flex-grow-1 text-start">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    :id="item.id"
                    v-model="item.completed"
                  />
                  <label class="form-check-label ms-2" :for="item.id">
                    <span :class="{ completed: item.completed }">
                      {{ item.taskName }}
                    </span>
                  </label>
                  <div
                    class="d-flex gap-2 text-muted mt-2 ps-1 align-items-center small"
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
                <div class="mt-2 pt-1 pb-2" v-if="showCommentId === item.id">
                  <textarea
                    class="form-control"
                    rows="2"
                    v-model="item.comment"
                    disabled
                  ></textarea>
                </div>
              </transition>
            </li>
          </template>
        </draggable>
      </ul>

      <div class="card-footer d-flex justify-content-between">
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
        <div class="modal-header">
          <h5 class="modal-title">編輯待辦事項</h5>
          <button type="button" class="btn-close" @click="closeDialog"></button>
        </div>
        <div class="modal-body text-left">
          <div>
            任務名稱
            <input type="text" class="form-control" v-model="editData.text" />
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
          <button class="btn btn-secondary" @click="closeDialog">取消</button>
          <button class="btn btn-primary" @click="updateDialogEdit">
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
console.log(todoStore);
console.log(todoStore.todos);

const props = defineProps({
  todos: {
    type: Array,
    default: [],
  },
});
const emit = defineEmits(["delete-all"]);

// //副本
// const todos_local = ref([...props.todos]);

// // 如果父層資料變動，也更新副本
// watch(
//   () => props.todos,
//   (newVal) => {
//     todos_local.value = [...newVal];
//   }
// );
// // // 拖曳後回傳更新結果給父層
// // const onDragEnd = () => {
// //   emit('update:items', localItems.value)
// // }

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
const cacheTaskName = ref("");
let cacheTask = {};
const isEdit = ref(false);
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
  // props.todos.splice(removeId, 1);
  todoStore.deleteTask(removeIndex);
};
const deleteAllTask = () => {
  //須從父層移除
  emit("delete-all");
};
const editTask = (item) => {
  isEdit = true;
  cacheTask = item;
  cacheTaskName.value = item.taskName;
};
const cancelEdit = () => {
  isEdit = false;
  cacheTask = {};
  cacheTaskName.value = "";
};
const doneEdit = (item) => {
  isEdit = false;
  item.taskName = cacheTaskName.value;
  cacheTask = {};
  cacheTaskName.value = "";
};
const lostFocus = (item) => {
  if (isEdit) {
    doneEdit(item);
  }
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
const sortDirection = ref(1); // 1: 升序, -1: 降序
const sortToggle = ref(false);

const toggleSort = () => {
  sortDirection.value *= -1;
  sortToggle.value = true;
  todoStore.todos.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return (
      (new Date(a.deadline || 0) - new Date(b.deadline || 0)) *
      sortDirection.value
    );
  });
};
const updateSort = () => {
  sortToggle.value = false;
};

const showCommentId = ref(null);
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
  let todoList = props.todos;

  if (todoList.length <= 0) {
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
<style>
.completed {
  text-decoration: line-through;
}
.starred {
  background: lightyellow;
}
.drag-handle:hover {
  color: #0d6efd;
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