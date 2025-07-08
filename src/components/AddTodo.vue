<template>
  <div id="app" class="container my-3">
    <div class="input-group mb-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">待辦事項</span>
      </div>
      <input
        v-model="text"
        type="text"
        class="form-control"
        placeholder="準備要做的任務"
      />
      <div class="input-group-append">
        <button class="btn btn-primary" type="button" @click="openEditDialog">
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


const emit = defineEmits(["addTodo"]);
const updateList = () => {
  // todoStore.addTask(text.value)
  // emit("addTodo", {
  //   id: crypto.randomUUID(),
  //   taskName: text.value,
  //   complete: false,
  // });
};
const openEditDialog = () => {
  todoStore.addTask(text.value);
};

</script>
<style>
</style>
