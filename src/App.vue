<template>
  <AddTodo @addTodo="handleAddTodo" />
  <TodoList :todos="todos" @delete-all="handleDeleteAll" />
</template>
<script setup>
import AddTodo from "./components/AddTodo.vue";
import TodoList from "./components/TodoList.vue";
import { ref } from "vue";

const todos = ref([
  {
    id: 1,
    taskName: "Test",
    completed: true,
  },
  {
    id: 2,
    taskName: "Test2",
    completed: false,
  }
]);

const handleAddTodo = (todo) => {
  todos.value.push(todo);
  console.log(todos.value);
};
const handleDeleteAll = () => {
  todos.value = [];
};
</script>
<style>
</style>