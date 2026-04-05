export type PendingOrderNotice = {
  rateProductIds: string[];
};

const ORDER_NOTICE_STORAGE_KEY = "classicalstore:pending-order-notice";

export function writePendingOrderNotice(notice: PendingOrderNotice) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    ORDER_NOTICE_STORAGE_KEY,
    JSON.stringify({
      rateProductIds: notice.rateProductIds.filter(Boolean),
    })
  );
}

export function readPendingOrderNotice() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawNotice = window.sessionStorage.getItem(ORDER_NOTICE_STORAGE_KEY);

  if (!rawNotice) {
    return null;
  }

  window.sessionStorage.removeItem(ORDER_NOTICE_STORAGE_KEY);

  try {
    const parsedNotice = JSON.parse(rawNotice);
    const rateProductIds = Array.isArray(parsedNotice?.rateProductIds)
      ? parsedNotice.rateProductIds.filter(
          (value: unknown): value is string => typeof value === "string" && Boolean(value.trim())
        )
      : [];

    return { rateProductIds };
  } catch {
    return null;
  }
}
