import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import dashboardWorkbench from '@/assets/dashboard-workbench.jpg';
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  ShoppingBag,
  Clock,
  RotateCcw,
  Receipt,
  Plus,
  ShoppingCart,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Wrench,
  BarChart3,
  Target,
  Calendar,
  Layers,
  AlertTriangle,
  ShieldCheck,
  ArrowRight,
  Zap,
  CheckCircle,
  ExternalLink,
  Crown
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { MonthlySalesData } from '../data/mockData';
import { Product, Sale, Purchase, Expense, UserRole, AuthUser } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface DashboardViewProps {
  onOpenPos: () => void;
  onNavigate: (route: string) => void;
  products: Product[];
  sales: Sale[];
  purchases?: Purchase[];
  expenses?: Expense[];
  lang?: Language;
  userRole?: UserRole;
  currentUser?: AuthUser | null;
  returnedStockValue?: number;
  onQuickRestock?: (productId: string, amount: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenPos,
  onNavigate,
  products,
  sales,
  purchases = [],
  expenses = [],
  lang = 'en',
  userRole = 'super_admin',
  currentUser,
  onQuickRestock
}) => {
  const t = TRANSLATIONS[lang];
  const [monthlyViewMode, setMonthlyViewMode] = useState<'comparison' | 'target' | 'mom'>('comparison');
  const [lowStockFilter, setLowStockFilter] = useState<'all' | 'out_of_stock' | 'critical'>('all');
  const [hoveredPoint, setHoveredPoint] = useState<{
    day: string;
    date: string;
    amount: number;
    x: number;
    y: number;
  } | null>(null);

  // Dynamic Last 7 Days Total Sales calculation for Recharts Bar Chart
  const last7DaysSalesData = useMemo(() => {
    const daysArr = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
      const dateFormatted = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' });

      // Match actual sales for this date
      const daySales = (sales || []).filter(s => {
        if (!s.saleDate) return false;
        try {
          const sDate = new Date(s.saleDate);
          return (
            sDate.getDate() === d.getDate() &&
            sDate.getMonth() === d.getMonth() &&
            sDate.getFullYear() === d.getFullYear()
          );
        } catch {
          return false;
        }
      });

      const actualSum = daySales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
      const actualInvoices = daySales.length;

      daysArr.push({
        day: dayName,
        date: dateFormatted,
        totalSales: actualSum,
        invoices: actualInvoices,
        avgTicket: actualInvoices > 0 ? Math.round(actualSum / actualInvoices) : 0
      });
    }
    return daysArr;
  }, [sales, lang]);

  const total7DaysSales = useMemo(() => 
    last7DaysSalesData.reduce((acc, d) => acc + d.totalSales, 0),
    [last7DaysSalesData]
  );
  const avg7DaysDaily = Math.round(total7DaysSales / 7);
  const total7DaysInvoices = useMemo(() => 
    last7DaysSalesData.reduce((acc, d) => acc + d.invoices, 0),
    [last7DaysSalesData]
  );
  const peakDaySales = useMemo(() => 
    [...last7DaysSalesData].sort((a, b) => b.totalSales - a.totalSales)[0],
    [last7DaysSalesData]
  );

  // Key metrics calculation for TAMANNA MOTORS (in BDT ৳)
  const totalSalesValue = useMemo(() => 
    (sales || []).reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0),
    [sales]
  );
  const netSalesValue = useMemo(() => 
    (sales || []).reduce((acc, s) => acc + ((Number(s.totalAmount) || 0) - (Number(s.taxAmount) || 0)), 0),
    [sales]
  );
  const invoiceDueValue = useMemo(() => 
    (sales || []).reduce((acc, s) => acc + (Number(s.invoiceDue) || 0), 0),
    [sales]
  );
  const totalPurchaseValue = useMemo(() => 
    (purchases || []).reduce((acc, p) => acc + (Number(p.grandTotal) || 0), 0),
    [purchases]
  );
  const purchaseDueValue = useMemo(() => 
    (purchases || []).reduce((acc, p) => acc + (Number(p.paymentDue) || 0), 0),
    [purchases]
  );
  const totalPurchaseReturnValue = 0.00;
  const totalExpensesValue = useMemo(() => 
    (expenses || []).reduce((acc, e) => acc + (Number(e.amount) || 0), 0),
    [expenses]
  );

  // Dynamic 30 Days sales calculation from real sales
  const last30DaysSalesData = useMemo(() => {
    const daysArr = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' });
      const dateFormatted = d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'short' });

      const daySales = (sales || []).filter(s => {
        if (!s.saleDate) return false;
        try {
          const sDate = new Date(s.saleDate);
          return (
            sDate.getDate() === d.getDate() &&
            sDate.getMonth() === d.getMonth() &&
            sDate.getFullYear() === d.getFullYear()
          );
        } catch {
          return false;
        }
      });

      const actualSum = daySales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
      daysArr.push({
        day: dayName,
        date: dateFormatted,
        amount: actualSum
      });
    }
    return daysArr;
  }, [sales, lang]);

  const total30DaysSales = useMemo(() => 
    last30DaysSalesData.reduce((acc, d) => acc + d.amount, 0),
    [last30DaysSalesData]
  );

  // Chart coordinate calculations
  const chartHeight = 220;
  const chartWidth = 720;
  const padding = { top: 25, right: 30, bottom: 35, left: 60 };

  const amounts = last30DaysSalesData.map(d => d.amount);
  const maxDayAmount = Math.max(...amounts, 100);
  const minAmount = 0;
  const maxAmount = maxDayAmount * 1.15;

  const points = last30DaysSalesData.map((item, index) => {
    const x = padding.left + (index / Math.max(1, last30DaysSalesData.length - 1)) * (chartWidth - padding.left - padding.right);
    const y = padding.top + (1 - (item.amount - minAmount) / Math.max(1, maxAmount - minAmount)) * (chartHeight - padding.top - padding.bottom);
    return { ...item, x, y };
  });

  const linePath = points.reduce((acc, point, i) => {
    return i === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`
    : '';

  // Dynamic monthly sales calculation from real sales
  const monthlySalesPerformance = useMemo<MonthlySalesData[]>(() => {
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesBn = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
    const currentYear = new Date().getFullYear();
    const currentMonthIdx = new Date().getMonth();

    const result: MonthlySalesData[] = [];
    let prevMonthAmount = 0;

    for (let m = 0; m <= currentMonthIdx; m++) {
      const monthSales = (sales || []).filter(s => {
        if (!s.saleDate) return false;
        try {
          const d = new Date(s.saleDate);
          return d.getFullYear() === currentYear && d.getMonth() === m;
        } catch {
          return false;
        }
      });

      const currentTotal = monthSales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);
      const ordersCount = monthSales.length;
      const momGrowth = prevMonthAmount > 0
        ? Number((((currentTotal - prevMonthAmount) / prevMonthAmount) * 100).toFixed(1))
        : 0;

      result.push({
        month: monthNamesEn[m],
        monthBn: monthNamesBn[m],
        fullMonth: `${monthNamesEn[m]} ${currentYear}`,
        current2026: currentTotal,
        previous2025: 0,
        prevMonthSales: prevMonthAmount,
        target: 0,
        momGrowth,
        yoyGrowth: 0,
        ordersCount
      });

      prevMonthAmount = currentTotal;
    }

    return result;
  }, [sales]);

  const totalMonthlySalesSum = useMemo(() => 
    monthlySalesPerformance.reduce((acc, m) => acc + m.current2026, 0),
    [monthlySalesPerformance]
  );
  const avgMonthlyRevenue = monthlySalesPerformance.length > 0
    ? Math.round(totalMonthlySalesSum / monthlySalesPerformance.length)
    : 0;
  const bestMonthObj = useMemo(() => {
    if (monthlySalesPerformance.length === 0) return null;
    return [...monthlySalesPerformance].sort((a, b) => b.current2026 - a.current2026)[0];
  }, [monthlySalesPerformance]);
  const currentMonthData = monthlySalesPerformance[monthlySalesPerformance.length - 1];

  // Low stock items
  const lowStockItems = products.filter(p => p.currentStock <= p.alertQuantity);

  return (
    <div className="tm-dashboard space-y-6">
      <section className="tm-home-banner relative isolate overflow-hidden">
        <img src={dashboardWorkbench} alt="" width={1536} height={512} className="absolute inset-0 -z-20 h-full w-full object-cover object-right" />
        <div className="tm-home-shade absolute inset-0 -z-10" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-home-banner-muted">
          <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-home-positive" />{lang === 'bn' ? 'হাজীগঞ্জ শাখা' : 'HAZIGONJ BRANCH'}</span>
          <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="mt-6 max-w-lg">
          <p className="text-sm text-home-banner-muted">{lang === 'bn' ? `স্বাগতম, ${currentUser?.name || 'সুপার অ্যাডমিন'}` : `Welcome back, ${currentUser?.name || 'Super Admin'}`}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-home-banner-ink sm:text-4xl">TAMANNA MOTORS<span className="text-home-positive">.</span></h1>
          <p className="mt-2 text-sm text-home-banner-muted">{lang === 'bn' ? 'আপনার ব্যবসার আজকের চিত্র' : 'Your business, at a glance.'}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={onOpenPos} className="h-11 bg-home-positive px-5 font-semibold text-home-on-positive hover:bg-home-positive/90"><ShoppingCart />{t.openPos}<ArrowUpRight /></Button>
            <Button variant="outline" onClick={() => onNavigate('reports-profit-loss')} className="h-11 border-home-banner-ink/25 bg-home-banner-ink/10 text-home-banner-ink hover:bg-home-banner-ink/20 hover:text-home-banner-ink"><BarChart3 />{lang === 'bn' ? 'লাভের রিপোর্ট' : 'Profit report'}</Button>
          </div>
        </div>
      </section>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div><h2 className="text-lg font-bold text-home-ink">{lang === 'bn' ? 'ব্যবসার সারসংক্ষেপ' : 'Business overview'}</h2><p className="mt-1 text-xs text-home-subtle">{lang === 'bn' ? 'সর্বসময়ের হিসাব' : 'All-time totals'}</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onNavigate('products-add')} className="border-home-border bg-home-surface text-home-ink hover:bg-home-muted"><Plus />{t.nav.addProduct}</Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('purchase-add')} className="border-home-border bg-home-surface text-home-ink hover:bg-home-muted"><ShoppingBag />{t.nav.addPurchase}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: t.dashboard.totalSales, value: totalSalesValue, icon: TrendingUp, tone: 'positive', note: `${sales.length} ${lang === 'bn' ? 'টি চালান' : 'sales invoices'}`, featured: true },
          { label: t.dashboard.netSales, value: netSalesValue, icon: CreditCard, tone: 'info', note: lang === 'bn' ? 'ভ্যাট বাদে বিক্রয়' : 'Sales excluding tax' },
          { label: t.dashboard.invoiceDue, value: invoiceDueValue, icon: AlertCircle, tone: 'warning', note: lang === 'bn' ? 'গ্রাহকদের নিকট পাওনা' : 'Customer receivables' },
          { label: t.dashboard.totalPurchase, value: totalPurchaseValue, icon: ShoppingBag, tone: 'info', note: `${purchases.length} ${lang === 'bn' ? 'টি ক্রয়' : 'purchase invoices'}` },
          { label: t.dashboard.purchaseDue, value: purchaseDueValue, icon: Clock, tone: 'danger', note: lang === 'bn' ? 'সরবরাহকারীদের দেনা' : 'Supplier payables' },
          { label: t.dashboard.purchaseReturn, value: totalPurchaseReturnValue, icon: RotateCcw, tone: 'info', note: lang === 'bn' ? 'ফেরতকৃত পণ্যের মূল্য' : 'Returned stock value' },
          { label: t.dashboard.totalExpenses, value: totalExpensesValue, icon: Receipt, tone: 'warning', note: lang === 'bn' ? 'ব্যবসার মোট খরচ' : 'Business expenses' },
          { label: lang === 'bn' ? 'পণ্যের ক্যাটালগ' : 'Product catalog', value: products.length, icon: Package, tone: 'positive', note: lang === 'bn' ? 'তালিকাভুক্ত পণ্য' : 'Catalog items', count: true },
        ].map(({ label, value, icon: Icon, tone, note, featured, count }) => (
          <article key={label} className={`tm-home-metric ${featured ? 'tm-home-metric-featured' : ''}`}>
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">{label}</span><span className={`tm-home-icon tm-home-tone-${tone}`}><Icon className="h-4 w-4" /></span></div>
            <p className="mt-4 break-words text-2xl font-bold tabular-nums">{count ? '' : '৳'}{value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
            <p className="mt-2 text-xs tm-home-metric-note">{note}</p>
          </article>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <div className="flex flex-col gap-3 border-l-4 border-home-warning bg-home-warning/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 shrink-0 text-home-warning" /><span className="text-sm text-home-ink"><strong>{lowStockItems.length}</strong> {lang === 'bn' ? 'টি পণ্যের স্টক কম রয়েছে' : 'products need stock attention'}</span></div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('products-list')} className="justify-start text-home-warning hover:bg-home-warning/10 hover:text-home-warning">{t.dashboard.oneClickToInventory}<ArrowRight /></Button>
        </div>
      )}

      {/* ============================================================== */}
      {/* Total Sales for the Last 7 Days (Recharts Bar Chart) */}
      {/* ============================================================== */}
      <div className="rounded-lg border border-home-border  bg-home-surface  p-5 shadow-xs transition-colors">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between pb-4 border-b border-home-border ">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-home-positive/10  text-home-positive ">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-home-ink  tracking-normal">
                {lang === 'bn' ? 'সাপ্তাহিক বিক্রয়' : 'Weekly sales'}
              </h3>
              
            </div>
            <p className="text-xs text-home-subtle  mt-1">
              {lang === 'bn'
                ? 'গত ৭ দিনের হিসাব'
                : 'Revenue over the last 7 days'}
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-lg bg-home-muted  p-2.5 border border-home-border ">
              <div className="text-[10px] uppercase font-bold text-home-subtle  tracking-normal">
                {lang === 'bn' ? '৭ দিনে মোট' : '7-Day Total'}
              </div>
              <div className="text-sm font-black font-mono text-home-positive  mt-0.5 tabular-nums">
                ৳{total7DaysSales.toLocaleString('en-US')}
              </div>
            </div>

            <div className="rounded-lg bg-home-muted  p-2.5 border border-home-border ">
              <div className="text-[10px] uppercase font-bold text-home-subtle  tracking-normal">
                {lang === 'bn' ? 'দৈনিক গড়' : 'Daily Average'}
              </div>
              <div className="text-sm font-black font-mono text-home-ink  mt-0.5 tabular-nums">
                ৳{avg7DaysDaily.toLocaleString('en-US')}
              </div>
            </div>

            <div className="rounded-lg bg-home-muted  p-2.5 border border-home-border ">
              <div className="text-[10px] uppercase font-bold text-home-subtle  tracking-normal">
                {lang === 'bn' ? 'সর্বোচ্চ বিক্রয় দিন' : 'Peak Day'}
              </div>
              <div className="text-sm font-black text-home-warning  mt-0.5 flex items-center gap-1">
                <span>{peakDaySales.day}</span>
                <span className="text-[10px] font-mono tabular-nums text-home-subtle ">
                  (৳{peakDaySales.totalSales.toLocaleString('en-US')})
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-home-muted  p-2.5 border border-home-border ">
              <div className="text-[10px] uppercase font-bold text-home-subtle  tracking-normal">
                {lang === 'bn' ? 'মোট চালান' : 'Invoices'}
              </div>
              <div className="text-sm font-black font-mono text-home-info  mt-0.5 tabular-nums">
                {total7DaysInvoices} {lang === 'bn' ? 'টি' : 'orders'}
              </div>
            </div>
          </div>
        </div>

        {/* Recharts BarChart Container */}
        <div className="mt-4 w-full h-[270px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={last7DaysSalesData}
              margin={{ top: 20, right: 15, bottom: 5, left: 10 }}
            >
              <defs>
                <linearGradient id="bar7DayGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--home-positive)" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="var(--home-positive)" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--home-border)"
                className=""
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: 'var(--home-border)' }}
                tick={{ fill: 'var(--home-subtle)', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis
                tickFormatter={(val: number) => `৳${(val / 1000).toFixed(0)}k`}
                tickLine={false}
                axisLine={{ stroke: 'var(--home-border)' }}
                tick={{ fill: 'var(--home-subtle)', fontSize: 11 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-home-border  bg-home-surface  p-3 shadow-xl text-xs space-y-1">
                        <div className="font-extrabold text-home-ink  flex items-center justify-between gap-3">
                          <span>{data.day} ({data.date})</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-home-positive/10  text-home-positive  font-bold">
                            {data.invoices} {lang === 'bn' ? 'চালান' : 'invoices'}
                          </span>
                        </div>
                        <div className="text-home-positive  font-black text-sm font-mono">
                          ৳{data.totalSales.toLocaleString('en-US')}
                        </div>
                        <div className="text-[10px] text-home-subtle  border-t border-home-border  pt-1">
                          {lang === 'bn' ? 'গড় অর্ডার মান:' : 'Avg ticket:'} ৳{data.avgTicket.toLocaleString('en-US')}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="totalSales"
                name={lang === 'bn' ? 'মোট বিক্রয়' : 'Total Sales'}
                fill="url(#bar7DayGrad)"
                radius={[6, 6, 0, 0]}
                maxBarSize={55}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Visuals Grid: "Sales Last 30 Days" Line Chart & Low Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Last 30 Days - Line Chart (Takes 2 Columns) */}
        <div className="rounded-lg border border-home-border  bg-home-surface  p-5 shadow-xs lg:col-span-2 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-home-border  gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-home-ink  tracking-normal">
                  {t.dashboard.salesLast30Days}
                </h3>
                <span className="text-xs text-home-subtle ">· {t.dashboard.dailyRevenueTrend}</span>
              </div>
              <p className="text-xs text-home-subtle  mt-0.5">
                {lang === 'bn' 
                  ? 'তামান্না মোটরসের সকল শাখা ও কাউন্টারের বিগত ৩০ দিনের বিক্রয় গ্রাফ।' 
                  : 'Past 30 days daily gross revenue across all Tamanna Motors retail registers.'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-home-positive" />
                <span className="text-home-subtle ">{lang === 'bn' ? 'দৈনিক বিক্রয়' : 'Daily Revenue'}</span>
              </div>
              <div className="font-mono text-home-ink  font-semibold tabular-nums">
                30-Day: ৳{total30DaysSales.toLocaleString('en-US')}
              </div>
            </div>
          </div>

          {/* Interactive SVG Line Chart */}
          <div className="relative mt-4 w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
            >
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--home-positive)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="var(--home-positive)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = padding.top + ratio * (chartHeight - padding.top - padding.bottom);
                const value = Math.round(maxAmount - ratio * (maxAmount - minAmount));
                return (
                  <g key={idx}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="currentColor"
                      className="text-home-subtle "
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] font-mono fill-home-subtle "
                    >
                      ৳{(value / 1000).toFixed(0)}k
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve */}
              <path d={areaPath} fill="url(#salesGrad)" />

              {/* Line Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke="var(--home-positive)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points & Hover Target Areas */}
              {points.map((pt, i) => (
                <g key={i}>
                  {(i % 5 === 0 || i === points.length - 1 || hoveredPoint?.date === pt.date) && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredPoint?.date === pt.date ? "5" : "3"}
                      className={
                        hoveredPoint?.date === pt.date
                          ? "fill-home-ink stroke-home-positive stroke-2 "
                          : "fill-home-positive"
                      }
                    />
                  )}

                  <rect
                    x={pt.x - 10}
                    y={padding.top}
                    width={20}
                    height={chartHeight - padding.top - padding.bottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />

                  {(i % 5 === 0 || i === points.length - 1) && (
                    <text
                      x={pt.x}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      className="text-[10px] font-mono fill-home-subtle "
                    >
                      {pt.day}
                    </text>
                  )}
                </g>
              ))}

              {hoveredPoint && (
                <line
                  x1={hoveredPoint.x}
                  y1={padding.top}
                  x2={hoveredPoint.x}
                  y2={chartHeight - padding.bottom}
                  stroke="var(--home-positive)"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}
            </svg>

            {hoveredPoint && (
              <div
                className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 rounded-lg border border-home-border  bg-home-muted text-home-ink px-2.5 py-1.5 shadow-lg"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                }}
              >
                <div className="text-[10px] text-home-subtle font-mono">{hoveredPoint.date}</div>
                <div className="text-xs font-bold font-mono text-home-positive tabular-nums">
                  ৳{hoveredPoint.amount.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Comprehensive 'Low Stock Alert' Widget */}
        <div className="flex flex-col rounded-lg border-2 border-home-warning  bg-home-surface  p-5 shadow-sm transition-colors">
          {/* Widget Header with One-Click link */}
          <div className="flex items-center justify-between pb-3 border-b border-home-border ">
            <div className="flex items-center gap-2">
              <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-home-warning/10  text-home-warning ">
                <AlertTriangle className="h-4 w-4" />
                {lowStockItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    
                    
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-home-ink  flex items-center gap-1.5">
                  <span>{t.dashboard.lowStockAlertTitle}</span>
                  {lowStockItems.length > 0 && (
                    <span className="rounded-full bg-home-danger text-home-ink text-[10px] font-black px-1.5 py-0.2">
                      {lowStockItems.length}
                    </span>
                  )}
                </h3>
              </div>
            </div>
            <Button variant="ghost"
              onClick={() => onNavigate('products-list')}
              className="flex items-center gap-1 text-xs font-bold text-home-positive  hover:text-home-positive  transition-colors"
              title="Navigate to complete inventory list"
            >
              <span>{t.dashboard.viewAll}</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>

          {/* Filter Pills for Low Stock */}
          {lowStockItems.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 py-2.5 border-b border-home-border text-[11px]">
              <Button variant="ghost"
                type="button"
                onClick={() => setLowStockFilter('all')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  lowStockFilter === 'all'
                    ? 'bg-home-warning text-home-ink font-bold shadow-xs'
                    : 'bg-home-muted  text-home-subtle '
                }`}
              >
                {lang === 'bn' ? 'সকল' : 'All'} ({lowStockItems.length})
              </Button>
              <Button variant="ghost"
                type="button"
                onClick={() => setLowStockFilter('out_of_stock')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  lowStockFilter === 'out_of_stock'
                    ? 'bg-home-danger text-home-ink font-bold shadow-xs'
                    : 'bg-home-muted  text-home-subtle '
                }`}
              >
                {t.dashboard.outOfStock} ({lowStockItems.filter(p => p.currentStock === 0).length})
              </Button>
              <Button variant="ghost"
                type="button"
                onClick={() => setLowStockFilter('critical')}
                className={`rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  lowStockFilter === 'critical'
                    ? 'bg-home-warning text-home-ink font-bold shadow-xs'
                    : 'bg-home-muted  text-home-subtle '
                }`}
              >
                {t.dashboard.criticalStock} ({lowStockItems.filter(p => p.currentStock > 0 && p.currentStock <= Math.ceil(p.alertQuantity / 2)).length})
              </Button>
            </div>
          )}

          {/* Low Stock Items List with One-Click Navigation & Progress Bars */}
          <div className="mt-2 flex-1 divide-y divide-home-border  overflow-y-auto max-h-[300px] pr-1">
            {lowStockItems.length === 0 ? (
              <div className="py-10 text-center text-xs space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-home-positive/10  text-home-positive mx-auto shadow-xs">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="font-bold text-home-ink ">
                  {t.dashboard.allStockHealthy}
                </div>
                <p className="text-[11px] text-home-subtle max-w-[220px] mx-auto">
                  {lang === 'bn' ? 'তামান্না মোটরসের সকল পার্টসের স্টক সন্তোষজনক অবস্থায় রয়েছে।' : 'No products have fallen below minimum reorder thresholds.'}
                </p>
              </div>
            ) : (
              (lowStockFilter === 'out_of_stock'
                ? lowStockItems.filter(p => p.currentStock === 0)
                : lowStockFilter === 'critical'
                ? lowStockItems.filter(p => p.currentStock > 0 && p.currentStock <= Math.ceil(p.alertQuantity / 2))
                : lowStockItems
              ).slice(0, 5).map((item) => {
                const isZero = item.currentStock === 0;
                const isCritical = !isZero && item.currentStock <= Math.ceil(item.alertQuantity / 2);
                const pct = Math.min(100, Math.round((item.currentStock / Math.max(1, item.alertQuantity)) * 100));

                return (
                  <div
                    key={item.id}
                    className="py-3 group flex flex-col gap-2 hover:bg-home-muted  p-2 rounded-lg transition-all cursor-pointer"
                    onClick={() => onNavigate('products-list')}
                    title="Click to view in inventory list"
                  >
                    <div className="flex items-start justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2.5">
                        <div className="h-9 w-9 rounded-lg overflow-hidden bg-home-muted  shrink-0 border border-home-border ">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-home-subtle">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-home-ink  group-hover:text-home-positive  transition-colors line-clamp-1">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-home-subtle font-mono mt-0.5">
                            {item.sku} · {item.businessLocation}
                          </div>
                        </div>
                      </div>

                      {/* Stock Level Badge */}
                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block font-mono text-[11px] font-black px-2 py-0.5 rounded-md tabular-nums ${
                            isZero
                              ? 'bg-home-danger/10  text-home-danger  border border-home-danger '
                              : isCritical
                              ? 'bg-home-warning/10  text-home-warning  border border-home-warning '
                              : 'bg-home-warning/10  text-home-warning  border border-home-warning '
                          }`}
                        >
                          {item.currentStock} / {item.alertQuantity} {lang === 'bn' ? 'টি' : 'qty'}
                        </span>
                        <div className="text-[10px] font-medium text-home-subtle mt-0.5">
                          ৳{item.sellingPrice.toFixed(0)}
                        </div>
                      </div>
                    </div>

                    {/* Stock level visual bar */}
                    <div className="w-full bg-home-muted  h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isZero ? 'bg-home-danger' : isCritical ? 'bg-home-danger' : 'bg-home-warning'
                        }`}
                        style={{ width: `${Math.max(5, pct)}%` }}
                      />
                    </div>

                    {/* Super Admin Quick Restock Action */}
                    {userRole === 'super_admin' && onQuickRestock && (
                      <div className="flex items-center justify-between pt-1 text-[10px]" onClick={(e) => e.stopPropagation()}>
                        <span className="text-home-warning  font-bold flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          <span>{isZero ? t.dashboard.outOfStock : isCritical ? t.dashboard.criticalStock : t.dashboard.lowStockNormal}</span>
                        </span>
                        <Button variant="ghost"
                          type="button"
                          onClick={() => onQuickRestock(item.id, 10)}
                          className="flex items-center gap-1 rounded-lg bg-home-positive hover:bg-home-positive/90 text-home-on-positive font-bold px-2 py-0.5 shadow-xs transition-transform active:scale-95"
                          title="Instantly add +10 stock (Super Admin)"
                        >
                          <Zap className="h-3 w-3" />
                          <span>{t.dashboard.quickRestock}</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* One-Click Navigation Buttons */}
          <div className="mt-4 pt-3 border-t border-home-border grid grid-cols-1 gap-2">
            <Button variant="ghost"
              onClick={() => onNavigate('products-list')}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-home-warning hover:bg-home-warning active:bg-home-warning py-2.5 text-xs font-extrabold text-home-ink shadow-xs transition-all active:scale-98"
              title="One-click direct navigation to inventory list"
            >
              <Package className="h-4 w-4" />
              <span>{t.dashboard.oneClickToInventory}</span>
            </Button>
            <Button variant="ghost"
              onClick={() => onNavigate('purchase-add')}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-home-border  bg-home-muted  py-2.5 text-xs font-bold text-home-ink  hover:bg-home-muted  transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.dashboard.createPoForLowStock}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* Monthly Sales Performance Trends (Recharts) */}
      {/* Visualizes monthly sales performance compared to previous months and year */}
      {/* ============================================================== */}
      <div className="rounded-lg border border-home-border  bg-home-surface  p-5 shadow-xs transition-colors">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-home-border ">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-home-positive/10  text-home-positive ">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-home-ink  tracking-normal">
                {t.dashboard.monthlySalesTrends}
              </h3>
              
            </div>
            <p className="text-xs text-home-subtle  mt-1">
              {t.dashboard.monthlySalesComparison}
            </p>
          </div>

          {/* View Mode Selector Tabs */}
          <div className="flex items-center gap-1.5 rounded-lg border border-home-border  bg-home-muted  p-1">
            <Button variant="ghost"
              type="button"
              onClick={() => setMonthlyViewMode('comparison')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                monthlyViewMode === 'comparison'
                  ? 'bg-home-surface  text-home-ink  shadow-xs'
                  : 'text-home-subtle  hover:text-home-ink '
              }`}
            >
              {t.dashboard.viewModeRevenue}
            </Button>
            <Button variant="ghost"
              type="button"
              onClick={() => setMonthlyViewMode('target')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                monthlyViewMode === 'target'
                  ? 'bg-home-surface  text-home-ink  shadow-xs'
                  : 'text-home-subtle  hover:text-home-ink '
              }`}
            >
              {t.dashboard.viewModeTarget}
            </Button>
            <Button variant="ghost"
              type="button"
              onClick={() => setMonthlyViewMode('mom')}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                monthlyViewMode === 'mom'
                  ? 'bg-home-surface  text-home-ink  shadow-xs'
                  : 'text-home-subtle  hover:text-home-ink '
              }`}
            >
              {t.dashboard.viewModeMoM}
            </Button>
          </div>
        </div>

        {/* Quick Analytical Metric Highlights */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 pb-4 border-b border-home-border ">
          <div className="rounded-lg border border-home-border  bg-home-muted  p-3">
            <div className="text-[11px] font-medium text-home-subtle ">{t.dashboard.avgMonthlyRevenue}</div>
            <div className="mt-1 font-mono text-base font-bold text-home-ink  tabular-nums">
              ৳{avgMonthlyRevenue.toLocaleString('en-US')}
            </div>
            <div className="mt-0.5 text-[10px] text-home-subtle ">
              {lang === 'bn' ? `${monthlySalesPerformance.length} মাসের গড় বিক্রয়` : `${monthlySalesPerformance.length}-month sales average`}
            </div>
          </div>
          <div className="rounded-lg border border-home-border  bg-home-muted  p-3">
            <div className="text-[11px] font-medium text-home-subtle ">{t.dashboard.bestMonth}</div>
            <div className="mt-1 font-mono text-base font-bold text-home-positive  tabular-nums">
              {bestMonthObj && bestMonthObj.current2026 > 0
                ? `${lang === 'bn' ? bestMonthObj.monthBn : bestMonthObj.month} (৳${(bestMonthObj.current2026 / 1000).toFixed(0)}k)`
                : (lang === 'bn' ? 'কোন বিক্রয় নেই' : 'No sales yet')}
            </div>
            <div className="mt-0.5 text-[10px] text-home-positive  font-medium">
              {bestMonthObj && bestMonthObj.current2026 > 0
                ? `${bestMonthObj.ordersCount} ${lang === 'bn' ? 'টি চালান' : 'invoices'}`
                : (lang === 'bn' ? 'পিওএস-এ বিক্রয় শুরু করুন' : 'Record sales in POS')}
            </div>
          </div>
          <div className="rounded-lg border border-home-border  bg-home-muted  p-3">
            <div className="text-[11px] font-medium text-home-subtle ">{t.dashboard.monthOverMonthGrowth}</div>
            <div className="mt-1 flex items-center gap-1 font-mono text-base font-bold text-home-info  tabular-nums">
              <ArrowUpRight className="h-4 w-4" />
              <span>{currentMonthData ? `${currentMonthData.momGrowth >= 0 ? '+' : ''}${currentMonthData.momGrowth}%` : '0%'}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-home-subtle ">
              {lang === 'bn' ? 'চলতি মাসের পরিবর্তন' : 'Current month MoM'}
            </div>
          </div>
          <div className="rounded-lg border border-home-border  bg-home-muted  p-3">
            <div className="text-[11px] font-medium text-home-subtle ">{lang === 'bn' ? 'মোট বিক্রয় চালানের সংখ্যা' : 'Total Invoices'}</div>
            <div className="mt-1 flex items-center gap-1 font-mono text-base font-bold text-home-positive  tabular-nums">
              <span>{(sales || []).length} {lang === 'bn' ? 'টি' : 'orders'}</span>
            </div>
            <div className="mt-0.5 text-[10px] text-home-positive  font-medium">
              {lang === 'bn' ? 'লাইভ সিস্টেম ডেটা' : 'Live system data'}
            </div>
          </div>
        </div>

        {/* Recharts Chart Container */}
        <div className="mt-4 w-full h-[320px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={monthlySalesPerformance}
              margin={{ top: 15, right: 15, bottom: 5, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--home-subtle)"
                opacity={0.2}
              />
              <XAxis
                dataKey={lang === 'bn' ? 'monthBn' : 'month'}
                tickLine={false}
                axisLine={{ stroke: 'var(--home-border)' }}
                tick={{ fontSize: 11 }}
              />
              {monthlyViewMode === 'mom' ? (
                <>
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlySalesData;
                        const current = data.current2026;
                        const prevYear = data.previous2025;
                        const prevMonth = data.prevMonthSales;
                        const diffPrevMonth = current - prevMonth;
                        const momPercent = data.momGrowth;

                        return (
                          <div className="rounded-lg border border-home-border  bg-home-muted  p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-2 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-home-border  pb-1.5 font-bold text-home-ink ">
                              <span>{data.fullMonth}</span>
                              <span className="text-[10px] text-home-subtle  font-mono">
                                {data.ordersCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-home-positive  font-bold">
                                <span>{t.dashboard.currentYear}:</span>
                                <span className="font-mono text-sm tabular-nums">৳{current.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-home-subtle ">
                                <span>{t.dashboard.previousMonth}:</span>
                                <span className="font-mono tabular-nums">৳{prevMonth.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-home-info  font-semibold">
                                <span>{t.dashboard.monthOverMonthGrowth}:</span>
                                <span className="font-mono tabular-nums">{momPercent > 0 ? `+${momPercent}%` : `${momPercent}%`}</span>
                              </div>
                            </div>
                            <div className="border-t border-home-border  pt-1.5 flex items-center justify-between text-[11px]">
                              <span className="text-home-subtle ">
                                {lang === 'bn' ? 'মাসিক পরিবর্তন' : 'Monthly Change'}:
                              </span>
                              <span className={`font-mono font-bold ${diffPrevMonth >= 0 ? 'text-home-positive ' : 'text-home-danger '}`}>
                                {diffPrevMonth >= 0 ? `+৳${diffPrevMonth.toLocaleString()}` : `-৳${Math.abs(diffPrevMonth).toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <ReferenceLine y={0} yAxisId="right" stroke="var(--home-danger)" strokeDasharray="3 3" />
                  <Bar
                    yAxisId="left"
                    dataKey="current2026"
                    name={t.dashboard.currentYear}
                    fill="var(--home-positive)"
                    opacity={0.3}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="momGrowth"
                    name={t.dashboard.monthOverMonthGrowth + " (%)"}
                    stroke="var(--home-info)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--home-info)', strokeWidth: 2, stroke: 'var(--home-surface)' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : monthlyViewMode === 'target' ? (
                <>
                  <YAxis
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlySalesData;
                        const current = data.current2026;
                        const target = data.target;
                        const diff = current - target;
                        const achievePercent = ((current / target) * 100).toFixed(1);

                        return (
                          <div className="rounded-lg border border-home-border  bg-home-muted  p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-2 min-w-[220px]">
                            <div className="flex items-center justify-between border-b border-home-border  pb-1.5 font-bold text-home-ink ">
                              <span>{data.fullMonth}</span>
                              <span className="text-[10px] text-home-subtle  font-mono">
                                {data.ordersCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-home-positive  font-bold">
                                <span>{t.dashboard.currentYear}:</span>
                                <span className="font-mono text-sm tabular-nums">৳{current.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-home-warning  font-semibold">
                                <span>{t.dashboard.salesTarget}:</span>
                                <span className="font-mono tabular-nums">৳{target.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="border-t border-home-border  pt-1.5 flex items-center justify-between text-[11px]">
                              <span className="text-home-subtle ">
                                {lang === 'bn' ? 'টার্গেট অর্জন' : 'Achievement'}:
                              </span>
                              <span className={`font-mono font-bold ${diff >= 0 ? 'text-home-positive ' : 'text-home-danger '}`}>
                                {achievePercent}% ({diff >= 0 ? `+৳${diff.toLocaleString()}` : `-৳${Math.abs(diff).toLocaleString()}`})
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar
                    dataKey="current2026"
                    name={t.dashboard.currentYear}
                    fill="var(--home-positive)"
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t.dashboard.salesTarget}
                    stroke="var(--home-warning)"
                    strokeWidth={2.5}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: 'var(--home-warning)', strokeWidth: 2, stroke: 'var(--home-surface)' }}
                    activeDot={{ r: 6 }}
                  />
                </>
              ) : (
                <>
                  <YAxis
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MonthlySalesData;
                        const current = data.current2026;
                        const prevYear = data.previous2025;
                        const prevMonth = data.prevMonthSales;
                        const diffPrevYear = current - prevYear;
                        const diffPrevMonth = current - prevMonth;
                        const momPercent = data.momGrowth;
                        const yoyPercent = data.yoyGrowth;

                        return (
                          <div className="rounded-lg border border-home-border  bg-home-muted  p-3.5 shadow-xl backdrop-blur-sm text-xs space-y-2 min-w-[230px]">
                            <div className="flex items-center justify-between border-b border-home-border  pb-1.5 font-bold text-home-ink ">
                              <span>{data.fullMonth}</span>
                              <span className="text-[10px] text-home-subtle  font-mono">
                                {data.ordersCount} {lang === 'bn' ? 'অর্ডার' : 'orders'}
                              </span>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-home-positive  font-bold">
                                <span>{t.dashboard.currentYear}:</span>
                                <span className="font-mono text-sm tabular-nums">৳{current.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-home-subtle ">
                                <span>{t.dashboard.previousYear}:</span>
                                <span className="font-mono tabular-nums">৳{prevYear.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-home-subtle ">
                                <span>{t.dashboard.previousMonth}:</span>
                                <span className="font-mono tabular-nums">৳{prevMonth.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between items-center text-home-warning  font-medium">
                                <span>{t.dashboard.salesTarget}:</span>
                                <span className="font-mono tabular-nums">৳{data.target.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="border-t border-home-border  pt-1.5 flex items-center justify-between text-[11px]">
                              <span className="text-home-subtle ">
                                {lang === 'bn' ? 'পূর্ববর্তী মাসের চেয়ে' : 'vs Previous Month'}:
                              </span>
                              <span className={`font-mono font-bold ${diffPrevMonth >= 0 ? 'text-home-positive ' : 'text-home-danger '}`}>
                                {diffPrevMonth >= 0 ? '+' : ''}{momPercent}% (৳{(diffPrevMonth >= 0 ? diffPrevMonth : -diffPrevMonth).toLocaleString()})
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-home-subtle ">
                                {lang === 'bn' ? 'গত বছরের তুলনায়' : 'vs Prior Year'}:
                              </span>
                              <span className="font-mono font-bold text-home-positive ">
                                +{yoyPercent}% (+৳{diffPrevYear.toLocaleString()})
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                  <Bar
                    dataKey="current2026"
                    name={t.dashboard.currentYear}
                    fill="var(--home-positive)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Bar
                    dataKey="previous2025"
                    name={t.dashboard.previousYear}
                    fill="var(--home-subtle)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={30}
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    name={t.dashboard.salesTarget}
                    stroke="var(--home-warning)"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent POS Sales Activity Table */}
      <div className="rounded-lg border border-home-border  bg-home-surface  p-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-home-border ">
          <div>
            <h3 className="text-sm font-bold text-home-ink ">{t.dashboard.recentSales}</h3>
            <p className="text-xs text-home-subtle ">
              {lang === 'bn' 
                ? 'তামান্না মোটরসের সাম্প্রতিক সম্পন্নকৃত রসিদ ও বিক্রয়।' 
                : 'Latest completed receipts across all active cash registers.'}
            </p>
          </div>
          <Button variant="ghost"
            onClick={() => onNavigate('sales-pos-list')}
            className="text-xs font-semibold text-home-positive  hover:underline"
          >
            {t.dashboard.viewAll}
          </Button>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-home-muted  text-[11px] font-semibold text-home-subtle  uppercase">
              <tr>
                <th className="py-2.5 px-3">Invoice No</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'গ্রাহক' : 'Customer'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'শাখা' : 'Location'}</th>
                <th className="py-2.5 px-3">{lang === 'bn' ? 'পেমেন্ট মাধ্যম' : 'Payment'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'আইটেম' : 'Items'}</th>
                <th className="py-2.5 px-3 text-right">{lang === 'bn' ? 'মোট মূল্য' : 'Total Amount'}</th>
                <th className="py-2.5 px-3 text-center">{lang === 'bn' ? 'অবস্থা' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-home-border  text-home-ink ">
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale.id} className="hover:bg-home-muted ">
                  <td className="py-2.5 px-3 font-mono font-bold text-home-ink ">{sale.invoiceNo}</td>
                  <td className="py-2.5 px-3">{sale.customerName}</td>
                  <td className="py-2.5 px-3">{sale.businessLocation}</td>
                  <td className="py-2.5 px-3">{sale.paymentMethod}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">{sale.itemsCount}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-home-ink ">
                    ৳{sale.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block text-[11px] font-bold ${
                        sale.paymentStatus === 'Paid'
                          ? 'text-home-positive '
                          : sale.paymentStatus === 'Partial'
                          ? 'text-home-warning '
                          : 'text-home-danger '
                      }`}
                    >
                      {sale.paymentStatus === 'Paid' ? (lang === 'bn' ? 'পরিশোধিত' : 'Paid') : sale.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
