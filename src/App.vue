<template>
  <div
    class="col-md-12 bg-header"
    style="font-family: 'Inter', 'Noto Sans TC', sans-serif"
  >
    <h1
      class="position-absolute m-3 text-white"
      style="font-family: Tektur, sans-serif"
    >
      TODO List
    </h1>
    <AddTodo />
    <TodoList />
  </div>
</template>
<script setup>
import AddTodo from "./components/AddTodo.vue";
import TodoList from "./components/TodoList.vue";
</script>
<style scoped>
.bg-header {
  position: absolute;
  top: 0;
  left: 0;
  /* background: linear-gradient(to right, #a18cd1, #9cdef7); */
  background: linear-gradient(160deg, #2b2b5f, #0fa2dc);
  /* min-height: 100vh; */
  height: 15rem;
  width: 100vw;
  /* background-size: cover; */
}
</style>