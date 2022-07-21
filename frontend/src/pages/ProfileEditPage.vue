<template>
  <div>
    <h1>Your Profile</h1>
    <van-form @submit="onSubmit.handler" v-if="store.user">
      <h2>User Data</h2>
      <van-cell-group inset>
        <van-field v-model="username" label="Name" placeholder="Your name" />
      </van-cell-group>

      <h2>Login Information</h2>
      <van-cell-group inset>
        <van-field v-model="store.user.email" label="Email" placeholder="Login with email" />
      </van-cell-group>

      <div style="margin: 16px">
        <van-button round block type="primary" native-type="submit" :disabled="onSubmit.loading" :loading="onSubmit.loading">
          Submit
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "../stores/user";
import { asyncLoading } from "../composables/loading";
import { ref } from "vue";

const store = useUserStore();
const username = ref("");

store.loadProfile();
const onSubmit = asyncLoading(async () => {
  try {
    await store.updateProfile({ username: username.value });
  } catch (error: any) {
    console.error(error);
    alert(error.error_description || error.message);
  }
});
</script>