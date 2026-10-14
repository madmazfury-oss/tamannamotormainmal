import { supabase } from "@/integrations/supabase/client";
import { Product, Sale, Contact, Expense, Purchase, AuthUser } from "../types";

const TABLE = "sync_documents";

function logError(context: string, error: unknown) {
  console.error(`[CloudSync ${context}]`, error instanceof Error ? error.message : String(error));
}

async function upsertDoc(collection: string, id: string, data: unknown) {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ collection, id, data: data as any, updated_at: new Date().toISOString() }, { onConflict: "collection,id" });
    if (error) logError(`write ${collection}/${id}`, error);
  } catch (e) {
    logError(`write ${collection}/${id}`, e);
  }
}

async function deleteDoc(collection: string, id: string) {
  try {
    const { error } = await supabase.from(TABLE).delete().eq("collection", collection).eq("id", id);
    if (error) logError(`delete ${collection}/${id}`, error);
  } catch (e) {
    logError(`delete ${collection}/${id}`, e);
  }
}

async function fetchDocs<T>(collection: string): Promise<T[]> {
  try {
    const { data, error } = await supabase.from(TABLE).select("data").eq("collection", collection);
    if (error) {
      logError(`list ${collection}`, error);
      return [];
    }
    return (data || []).map((row: any) => row.data as T);
  } catch (e) {
    logError(`list ${collection}`, e);
    return [];
  }
}

function filterStaff(users: AuthUser[]): AuthUser[] {
  return users.filter(
    (u) =>
      u &&
      u.username !== "admin" &&
      u.id !== "usr-admin-default" &&
      u.id !== "usr-jubo-default" &&
      u.id !== "usr-sahidul-default"
  );
}

function subscribe<T>(collection: string, callback: (items: T[]) => void, map?: (items: T[]) => T[]) {
  let active = true;
  const load = async () => {
    const items = await fetchDocs<T>(collection);
    if (active) callback(map ? map(items) : items);
  };
  load();
  const channel = supabase
    .channel(`sync_${collection}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: TABLE, filter: `collection=eq.${collection}` },
      () => load()
    )
    .subscribe();
  return () => {
    active = false;
    supabase.removeChannel(channel);
  };
}

export const FirestoreSync = {
  upsertProduct: (product: Product) => upsertDoc("products", product.id, product),
  deleteProduct: (productId: string) => deleteDoc("products", productId),
  fetchProducts: () => fetchDocs<Product>("products"),

  upsertSale: (sale: Sale) => upsertDoc("sales", sale.id, sale),
  deleteSale: (saleId: string) => deleteDoc("sales", saleId),
  fetchSales: () => fetchDocs<Sale>("sales"),

  upsertContact: (contact: Contact) => upsertDoc("contacts", contact.id, contact),
  deleteContact: (contactId: string) => deleteDoc("contacts", contactId),
  fetchContacts: () => fetchDocs<Contact>("contacts"),

  upsertPurchase: (purchase: Purchase) => upsertDoc("purchases", purchase.id, purchase),
  deletePurchase: (purchaseId: string) => deleteDoc("purchases", purchaseId),
  fetchPurchases: () => fetchDocs<Purchase>("purchases"),

  upsertExpense: (expense: Expense) => upsertDoc("expenses", expense.id, expense),
  deleteExpense: (expenseId: string) => deleteDoc("expenses", expenseId),
  fetchExpenses: () => fetchDocs<Expense>("expenses"),

  async clearCollection(collName: "products" | "sales" | "contacts" | "purchases" | "expenses") {
    try {
      const { error } = await supabase.from(TABLE).delete().eq("collection", collName);
      if (error) logError(`clear ${collName}`, error);
    } catch (e) {
      logError(`clear ${collName}`, e);
    }
  },

  upsertUser: (user: AuthUser) => upsertDoc("users", user.id, user),
  deleteUser: (userId: string) => deleteDoc("users", userId),
  fetchUsers: async () => filterStaff(await fetchDocs<AuthUser>("users")),

  subscribeProducts: (cb: (items: Product[]) => void) => subscribe<Product>("products", cb),
  subscribeSales: (cb: (items: Sale[]) => void) => subscribe<Sale>("sales", cb),
  subscribeContacts: (cb: (items: Contact[]) => void) => subscribe<Contact>("contacts", cb),
  subscribeUsers: (cb: (items: AuthUser[]) => void) => subscribe<AuthUser>("users", cb, filterStaff),
};
