<template>
  <div class="container my-5 col-md-4">
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text bg-custom text-costom" id="basic-addon1"
          >待辦事項</span
        >
      </div>
      <input
        v-model="text"
        type="text"
        class="form-control"
        placeholder="準備要做的任務"
      />
      <div class="input-group-append">
        <button
          class="btn btn-highlight text-costom"
          type="button"
          @click="addDialog"
        >
          新增
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref } from "vue";
import { useTodoStore } from "../stores/todo.js";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.min.css";

const todoStore = useTodoStore();

const text = ref("");

const addDialog = () => {
  todoStore.addTask(text.value);
  todoStore.sortToggle = false;
};
</script>
<style scoped>
.text-costom {
  /* color: #4b5056; */
  color: black;
}
.bg-custom {
  background: linear-gradient(to bottom, #f4b398, #f7cab6);
}
.btn-highlight {
  background: linear-gradient(to bottom, #fdac58, #ff8221);
}
</style>
