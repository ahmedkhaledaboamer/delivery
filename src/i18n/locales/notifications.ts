// Strings for the "notifications" namespace. Use as t("notifications.key"). Keep en and ar keys in sync.
const notifications = {
  en: {
    title: "Notifications",
    unreadCount: "{n} unread",
    allCaughtUp: "All caught up",
    markAllRead: "Mark all as read",
    empty: "No notifications yet.",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    opensRelated: "Opens the related page",
    unread: "Unread",
  } as Record<string, string>,
  ar: {
    title: "الإشعارات",
    unreadCount: "{n} غير مقروءة",
    allCaughtUp: "لا جديد، اطّلعت على كل شيء",
    markAllRead: "تحديد الكل كمقروء",
    empty: "لا توجد إشعارات بعد.",
    today: "اليوم",
    yesterday: "أمس",
    earlier: "سابقًا",
    opensRelated: "يفتح الصفحة المرتبطة",
    unread: "غير مقروء",
  } as Record<string, string>,
};

export default notifications;
