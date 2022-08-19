import { useUserStore } from "@/stores/user";
import { createRouter, createWebHashHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ProfileEditPage from "../pages/ProfileEditPage.vue";
import { supabase } from "@/services/supabase";
import EventEditPage from "@/pages/EventEditPage.vue";

const router = createRouter({
  history: createWebHashHistory("import.meta.env.BASE_URL"),
  routes: [
    {
      path: "/",
      component: HomePage,
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: "/login",
      component: LoginPage,
    },
    {
      path: "/profile-edit",
      component: ProfileEditPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/edit-event",
      component: EventEditPage,
    },
    {
      path: "/about",
      // lazy-loading: only load when route is visited
      component: () => import("../pages/AboutPage.vue"),
    },
    // TODO: Better supabase callback handling https://github.com/JMaylor/vuepabase/blob/5e5668af6b4430a0c6dc7f6b72b38f885de2d2de/src/router.ts#L51
    // not sure if /callback is the correct route though ^
  ],
});

router.beforeEach((to, from, next) => {
  const loggedIn = supabase.auth.user();

  if (to.matched.some((record) => record.meta.requiresAuth) && !loggedIn) {
    console.warn(
      "tried to access",
      to.fullPath,
      "but not logged in, forwarding to /login"
    );
    // showToast("Please log in first!");
    next({ path: "/login", query: { redirect: to.fullPath } });
    return;
  }

  const registered = useUserStore().isRegistered;
  if (
    to.matched.some((record) => record.meta.requiresProfile) &&
    loggedIn &&
    !registered
  ) {
    console.warn(
      "tried to access",
      to.fullPath,
      "but not registered, forwarding to /profile-edit"
    );
    next({ path: "/profile-edit", query: { redirect: to.fullPath } });
    return;
  }
  next();
});

export default router;
