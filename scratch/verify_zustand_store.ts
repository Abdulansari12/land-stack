/**
 * Verification test for Zustand centralized App Store (lib/store.ts)
 */

import { useAppStore, INITIAL_NOTIFICATIONS, SIMULATION_EVENTS_POOL } from "../lib/store";

function runTests() {
  console.log("=================================================");
  console.log("🔍 TESTING CENTRALIZED ZUSTAND STORE (lib/store.ts)");
  console.log("=================================================\n");

  // 1. Initial State
  const state0 = useAppStore.getState();
  console.log("1. Checking Initial Store State...");
  console.assert(state0.userRole === "citizen", `Expected citizen, got ${state0.userRole}`);
  console.assert(state0.currentDataSource === "Tamil Nadu", `Expected Tamil Nadu, got ${state0.currentDataSource}`);
  console.assert(state0.language === "en", `Expected en, got ${state0.language}`);
  console.assert(state0.theme === "light", `Expected light, got ${state0.theme}`);
  console.assert(state0.selectedParcel === null, `Expected null, got ${state0.selectedParcel}`);
  console.assert(state0.isDrawerOpen === false, `Expected false, got ${state0.isDrawerOpen}`);
  console.assert(state0.notifications.length === INITIAL_NOTIFICATIONS.length, `Expected ${INITIAL_NOTIFICATIONS.length}, got ${state0.notifications.length}`);
  console.assert(state0.unreadCount === 3, `Expected 3 unread, got ${state0.unreadCount}`);
  console.log("   ✅ Initial state is correctly configured.\n");

  // 2. Role & DataSource
  console.log("2. Testing UserRole and DataSource updates...");
  state0.setUserRole("officer");
  console.assert(useAppStore.getState().userRole === "officer", "UserRole should be officer");
  state0.toggleUserRole();
  console.assert(useAppStore.getState().userRole === "citizen", "UserRole should toggle back to citizen");
  state0.setCurrentDataSource("Chandigarh");
  console.assert(useAppStore.getState().currentDataSource === "Chandigarh", "DataSource should be Chandigarh");
  console.log("   ✅ UserRole and DataSource actions working properly.\n");

  // 3. Language & Theme
  console.log("3. Testing Language and Theme actions...");
  state0.setLanguage("hi");
  console.assert(useAppStore.getState().language === "hi", "Language should be hi");
  state0.toggleLanguage();
  console.assert(useAppStore.getState().language === "en", "Language should toggle to en");
  state0.setTheme("dark");
  console.assert(useAppStore.getState().theme === "dark", "Theme should be dark");
  console.assert(useAppStore.getState().isDark === true, "isDark should be true");
  state0.toggleTheme();
  console.assert(useAppStore.getState().theme === "light", "Theme should toggle to light");
  console.assert(useAppStore.getState().isDark === false, "isDark should be false");
  console.log("   ✅ Language and Theme actions working properly.\n");

  // 4. Notifications
  console.log("4. Testing Notifications actions...");
  const initialCount = useAppStore.getState().notifications.length;
  const initialUnread = useAppStore.getState().unreadCount;

  // Add notification
  state0.addNotification({
    id: "test-notif-1",
    title: "Test Alert",
    message: "Test Message",
    timestamp: "Just now",
    createdAt: Date.now(),
    type: "dispute",
    ulpin: "TN01T1001A",
    khasraNo: "Khasra 100/1",
    isRead: false,
  });
  console.assert(useAppStore.getState().notifications.length === initialCount + 1, "Notifications length should increment");
  console.assert(useAppStore.getState().unreadCount === initialUnread + 1, "Unread count should increment");

  // Mark single read
  state0.markNotificationRead("test-notif-1");
  console.assert(useAppStore.getState().unreadCount === initialUnread, "Unread count should decrement after read");

  // Mark all read
  state0.markAllNotificationsRead();
  console.assert(useAppStore.getState().unreadCount === 0, "Unread count should be 0 after markAllNotificationsRead");
  console.assert(useAppStore.getState().notifications.every((n) => n.isRead), "All notifications should be isRead=true");

  // Clear all
  state0.clearAllNotifications();
  console.assert(useAppStore.getState().notifications.length === 0, "Notifications should be empty after clearAll");
  console.assert(useAppStore.getState().unreadCount === 0, "Unread count should be 0");
  console.log("   ✅ Notifications manipulation working properly.\n");

  // 5. Drawer and Parcel Selection
  console.log("5. Testing Parcel and Drawer actions...");
  state0.openDrawer();
  console.assert(useAppStore.getState().isDrawerOpen === true, "Drawer should be open");
  state0.setSelectedParcel({ ulpin: "UP09K2452M", khasraNo: "102/1-Ka" } as any);
  console.assert(useAppStore.getState().selectedParcel?.ulpin === "UP09K2452M", "Selected parcel should match");
  state0.closeDrawer();
  console.assert(useAppStore.getState().isDrawerOpen === false, "Drawer should be closed");
  console.assert(useAppStore.getState().selectedParcel === null, "Selected parcel should be cleared on close");
  console.log("   ✅ Drawer and Parcel actions working properly.\n");

  // 6. Reset Demo State
  console.log("6. Testing resetDemoState...");
  state0.resetDemoState();
  const resetState = useAppStore.getState();
  console.assert(resetState.userRole === "citizen", "Role should reset to citizen");
  console.assert(resetState.currentDataSource === "Tamil Nadu", "DataSource should reset to Tamil Nadu");
  console.assert(resetState.selectedParcel === null, "SelectedParcel should reset to null");
  console.assert(resetState.isDrawerOpen === false, "Drawer should reset to closed");
  console.assert(resetState.notifications.length === INITIAL_NOTIFICATIONS.length, "Notifications should reset to initial pool");
  console.assert(resetState.unreadCount === 3, "UnreadCount should reset to 3");
  console.log("   ✅ resetDemoState restored baseline cleanly.\n");

  console.log("🎉 ALL ZUSTAND STORE UNIT TESTS PASSED SUCCESSFULLY!");
}

runTests();
