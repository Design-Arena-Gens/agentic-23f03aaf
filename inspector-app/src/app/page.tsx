"use client";

import { FormEvent, useMemo, useState } from "react";
import { differenceInDays, format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

type SectionId =
  | "overview"
  | "managers"
  | "schools"
  | "reports"
  | "monitoring"
  | "dispatch"
  | "performance"
  | "gmail"
  | "appointments";

type Manager = {
  id: number;
  name: string;
  school: string;
  phone: string;
  status: "نشط" | "متابعة" | "إجازة";
};

type School = {
  id: number;
  name: string;
  director: string;
  studentCount: number;
  district: string;
};

type Report = {
  id: number;
  title: string;
  date: string;
  summary: string;
};

type MonitoringEntry = {
  id: number;
  manager: string;
  focus: string;
  status: "مكتمل" | "جارٍ" | "متأخر";
  notes: string;
};

type DispatchEntry = {
  id: number;
  subject: string;
  sentTo: string;
  sendDate: string;
  dueDate: string;
};

type GmailDraft = {
  id: number;
  to: string;
  subject: string;
  body: string;
  status: "جاهز" | "مرسل";
  scheduledFor?: string;
  sentAt?: string;
};

type Appointment = {
  id: number;
  title: string;
  location: string;
  date: string;
  time: string;
  attendees: string;
};

const sectionMeta: Record<
  SectionId,
  { label: string; description: string; accent: string }
> = {
  overview: {
    label: "نظرة شاملة",
    description: "ملخص سريع لأهم مؤشرات المفتش.",
    accent: "from-indigo-500/20 to-indigo-500/5",
  },
  managers: {
    label: "معلومات المديرين",
    description: "إدارة بيانات المديرين ومتابعة حالاتهم.",
    accent: "from-amber-500/20 to-amber-500/5",
  },
  schools: {
    label: "معلومات الابتدائيات",
    description: "تفاصيل المدارس الابتدائية المرتبطة بالمفتشية.",
    accent: "from-emerald-500/20 to-emerald-500/5",
  },
  reports: {
    label: "تقارير المفتشية",
    description: "أرشيف التقارير والملخصات الميدانية.",
    accent: "from-sky-500/20 to-sky-500/5",
  },
  monitoring: {
    label: "متابعة المدراء",
    description: "خطة المتابعة والزيارات مع حالة التنفيذ.",
    accent: "from-rose-500/20 to-rose-500/5",
  },
  dispatch: {
    label: "جداول الإرسال",
    description: "تخطيط ومتابعة إرسال المراسلات.",
    accent: "from-purple-500/20 to-purple-500/5",
  },
  performance: {
    label: "حساب المردودية",
    description: "احتساب مؤشرات الأداء بناءً على المعطيات.",
    accent: "from-lime-500/20 to-lime-500/5",
  },
  gmail: {
    label: "مراسلات Gmail",
    description: "تحضير الرسائل وحجز إرسالها عبر Gmail.",
    accent: "from-fuchsia-500/20 to-fuchsia-500/5",
  },
  appointments: {
    label: "جدولة المواعيد",
    description: "تنظيم الاجتماعات والتنبيه بالمواعيد القريبة.",
    accent: "from-orange-500/20 to-orange-500/5",
  },
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("overview");
  const [loginError, setLoginError] = useState("");

  const [managers, setManagers] = useState<Manager[]>([
    {
      id: 1,
      name: "عبد الكريم تواتي",
      school: "ابتدائية النور",
      phone: "0550 123 456",
      status: "نشط",
    },
    {
      id: 2,
      name: "سميرة بن سليمان",
      school: "ابتدائية 20 أوت",
      phone: "0551 789 321",
      status: "متابعة",
    },
  ]);

  const [schools, setSchools] = useState<School[]>([
    {
      id: 1,
      name: "ابتدائية النور",
      director: "عبد الكريم تواتي",
      studentCount: 485,
      district: "الدار البيضاء",
    },
    {
      id: 2,
      name: "ابتدائية الأمل",
      director: "ليلى عوادي",
      studentCount: 360,
      district: "باب الزوار",
    },
  ]);

  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: "متابعة نتائج الفصل الأول",
      date: "2024-02-12",
      summary: "تحسن بنسبة 8٪ في مادة الرياضيات وتوصيات بتقوية القراءة.",
    },
    {
      id: 2,
      title: "زيارة تفقدية لابتدائية الأمل",
      date: "2024-03-02",
      summary: "تم فحص تجهيزات المخبر والمكتبة وتسجيل عجز في الوسائل الرقمية.",
    },
  ]);

  const [monitoringEntries, setMonitoringEntries] = useState<MonitoringEntry[]>([
    {
      id: 1,
      manager: "سميرة بن سليمان",
      focus: "تنفيذ برنامج الدعم",
      status: "جارٍ",
      notes: "البرنامج في أسبوعه الثاني، مؤشرات حضور جيدة.",
    },
    {
      id: 2,
      manager: "عبد الكريم تواتي",
      focus: "تحسين التواصل مع الأولياء",
      status: "مكتمل",
      notes: "تم إنشاء مجموعة رقمية وتفعيل لقاءات دورية.",
    },
  ]);

  const [dispatches, setDispatches] = useState<DispatchEntry[]>([
    {
      id: 1,
      subject: "مراسلة حول مناقشة نتائج الفصل",
      sentTo: "مديري الابتدائيات",
      sendDate: "2024-03-05",
      dueDate: "2024-03-15",
    },
    {
      id: 2,
      subject: "تذكير بإحصاء الوسائل التربوية",
      sentTo: "مديري المقاطعة ب",
      sendDate: "2024-04-01",
      dueDate: "2024-04-07",
    },
  ]);

  const [drafts, setDrafts] = useState<GmailDraft[]>([
    {
      id: 1,
      to: "primary.zone@example.com",
      subject: "طلب حضور اجتماع التشخيص",
      body: "السلام عليكم، نذكركم باجتماع التشخيص يوم الإثنين القادم على الساعة التاسعة.",
      status: "جاهز",
      scheduledFor: "2024-04-18T09:00",
    },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 1,
      title: "اجتماع لجنة المتابعة",
      location: "مقر المفتشية",
      date: "2024-04-20",
      time: "10:00",
      attendees: "مديري المقاطعة ب، الطاقم البيداغوجي",
    },
    {
      id: 2,
      title: "زيارة ميدانية لابتدائية الأمل",
      location: "ابتدائية الأمل",
      date: "2024-04-23",
      time: "09:00",
      attendees: "فريق المتابعة، مدير المدرسة",
    },
  ]);

  const [performanceData, setPerformanceData] = useState({
    students: 0,
    successes: 0,
    activities: 0,
    observations: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    location: "",
    date: "",
    time: "",
    attendees: "",
  });

  const upcomingAlerts = useMemo(() => {
    const now = new Date();
    return appointments
      .map((appointment) => ({
        ...appointment,
        daysUntil: differenceInDays(parseISO(appointment.date), now),
      }))
      .filter((item) => item.daysUntil >= 0 && item.daysUntil <= 3)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [appointments]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") || "").trim();
    const password = String(form.get("password") || "").trim();

    if (username === "inspector" && password === "admin123") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("بيانات الدخول غير صحيحة، يرجى المحاولة من جديد.");
    }
  };

  const handleAddManager = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const school = String(form.get("school") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const status = form.get("status");

    if (!name || !school) {
      return;
    }

    setManagers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        school,
        phone,
        status: (status as Manager["status"]) || "نشط",
      },
    ]);
    event.currentTarget.reset();
  };

  const handleAddSchool = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    const director = String(form.get("director") || "").trim();
    const studentCount = Number(form.get("studentCount") || 0);
    const district = String(form.get("district") || "").trim();

    if (!name || !director) {
      return;
    }

    setSchools((prev) => [
      ...prev,
      {
        id: Date.now(),
        name,
        director,
        studentCount,
        district,
      },
    ]);
    event.currentTarget.reset();
  };

  const handleAddReport = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const date = String(form.get("date") || "");
    const summary = String(form.get("summary") || "").trim();

    if (!title || !date) {
      return;
    }

    setReports((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        date,
        summary,
      },
    ]);
    event.currentTarget.reset();
  };

  const handleAddMonitoringEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const manager = String(form.get("manager") || "").trim();
    const focus = String(form.get("focus") || "").trim();
    const status = form.get("status");
    const notes = String(form.get("notes") || "").trim();

    if (!manager || !focus) {
      return;
    }

    setMonitoringEntries((prev) => [
      ...prev,
      {
        id: Date.now(),
        manager,
        focus,
        status: (status as MonitoringEntry["status"]) || "جارٍ",
        notes,
      },
    ]);
    event.currentTarget.reset();
  };

  const handleAddDispatch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const subject = String(form.get("subject") || "").trim();
    const sentTo = String(form.get("sentTo") || "").trim();
    const sendDate = String(form.get("sendDate") || "");
    const dueDate = String(form.get("dueDate") || "");

    if (!subject || !sendDate) {
      return;
    }

    setDispatches((prev) => [
      ...prev,
      {
        id: Date.now(),
        subject,
        sentTo,
        sendDate,
        dueDate,
      },
    ]);
    event.currentTarget.reset();
  };

  const handlePerformanceCalculation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const students = Number(form.get("students") || 0);
    const successes = Number(form.get("successes") || 0);
    const activities = Number(form.get("activities") || 0);
    const observations = String(form.get("observations") || "").trim();

    setPerformanceData({
      students,
      successes,
      activities,
      observations,
    });
  };

  const performanceScore = useMemo(() => {
    if (!performanceData.students) {
      return 0;
    }
    const successRate =
      (performanceData.successes / performanceData.students) * 70;
    const activityRate = Math.min(performanceData.activities * 10, 30);
    return Math.min(Math.round(successRate + activityRate), 100);
  }, [performanceData]);

  const handleAddDraft = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const to = String(form.get("to") || "").trim();
    const subject = String(form.get("subject") || "").trim();
    const body = String(form.get("body") || "").trim();
    const scheduleDate = String(form.get("scheduleDate") || "");

    if (!to || !subject || !body) {
      return;
    }

    const id = Date.now();

    setDrafts((prev) => [
      ...prev,
      {
        id,
        to,
        subject,
        body,
        status: "جاهز",
        scheduledFor: scheduleDate || undefined,
      },
    ]);

    if (scheduleDate) {
      setTimeout(() => {
        setDrafts((prev) =>
          prev.map((draft) =>
            draft.id === id
              ? {
                  ...draft,
                  status: "مرسل",
                  sentAt: format(new Date(), "yyyy-MM-dd HH:mm"),
                }
              : draft
          )
        );
      }, 2000);
    }

    event.currentTarget.reset();
  };

  const handleAddAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const location = String(form.get("location") || "").trim();
    const date = String(form.get("date") || "");
    const time = String(form.get("time") || "");
    const attendees = String(form.get("attendees") || "").trim();

    if (!title || !date || !time) {
      return;
    }

    setAppointments((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        location,
        date,
        time,
        attendees,
      },
    ]);
    setAppointmentForm({
      title: "",
      location: "",
      date: "",
      time: "",
      attendees: "",
    });
    event.currentTarget.reset();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-24">
          <div className="w-full max-w-lg rounded-3xl bg-white/10 p-10 shadow-2xl backdrop-blur-lg">
            <div className="mb-12 text-center text-white">
              <h1 className="text-3xl font-bold tracking-tight">
                المفتش - بوابة الدخول
              </h1>
              <p className="mt-3 text-sm text-slate-200">
                أدخل بيانات الاعتماد للوصول إلى قاعدة بيانات المفتشية وأدوات
                المتابعة.
              </p>
            </div>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-100"
                  htmlFor="username"
                >
                  اسم المستخدم
                </label>
                <input
                  id="username"
                  name="username"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                  placeholder="inspector"
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-semibold text-slate-100"
                  htmlFor="password"
                >
                  كلمة المرور
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300/60"
                  placeholder="admin123"
                />
              </div>
              {loginError ? (
                <p className="text-sm font-medium text-rose-200">
                  {loginError}
                </p>
              ) : null}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-600 hover:to-sky-600"
              >
                دخول النظام
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950/95 pb-16">
      <div className="relative mx-auto max-w-6xl px-6 pt-16">
        <div className="mb-10 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-slate-200">منصة إدارة المفتش</p>
            <h2 className="mt-2 text-3xl font-bold text-white">المفتش</h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">
              تحكم شامل في المعلومات الميدانية، المتابعات، المراسلات، وجدولة
              المواعيد مع نظام تنبيه ذكي.
            </p>
          </div>
          <div className="flex min-w-[240px] flex-col gap-3 rounded-2xl bg-black/30 p-5 text-slate-200">
            <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm">
              <span>تنبيهات قريبة</span>
              <span className="rounded-lg bg-sky-500/20 px-3 py-1 text-xs font-semibold text-sky-200">
                {upcomingAlerts.length}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {upcomingAlerts.length ? (
                upcomingAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-4 py-3 text-sky-50"
                  >
                    <p className="font-semibold">{alert.title}</p>
                    <p className="mt-1">
                      {format(parseISO(alert.date), "iiii dd MMM", {
                        locale: ar,
                      })}{" "}
                      - {alert.time}
                    </p>
                    <p className="mt-1 text-sky-200">
                      متبقٍ{" "}
                      {alert.daysUntil === 0
                        ? "اليوم"
                        : `${alert.daysUntil} يوم`}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 px-4 py-3 text-slate-300">
                  لا توجد مواعيد عاجلة خلال الأيام الثلاثة القادمة.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(sectionMeta) as SectionId[]).map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => setActiveSection(section)}
              className={`group rounded-3xl border border-white/10 bg-gradient-to-br ${sectionMeta[section].accent} p-6 text-right transition hover:border-white/30 hover:shadow-lg ${
                activeSection === section ? "ring-2 ring-white/60" : ""
              }`}
            >
              <p className="text-sm font-semibold text-slate-100">
                {sectionMeta[section].label}
              </p>
              <p className="mt-3 text-xs text-slate-200">
                {sectionMeta[section].description}
              </p>
            </button>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-xl backdrop-blur-xl">
          {activeSection === "overview" ? (
            <section className="space-y-6">
              <header className="flex flex-col gap-2 border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">لوحة القيادة السريعة</h3>
                <p className="text-sm text-slate-200">
                  مؤشرات مختصرة حول نشاط المفتش، المراسلات والمواعيد.
                </p>
              </header>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-200">عدد المديرين</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {managers.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    {
                      managers.filter((manager) => manager.status === "متابعة")
                        .length
                    }{" "}
                    في وضعية متابعة خاصة.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-200">مدارس تحت الإشراف</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {schools.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    متوسط عدد التلاميذ لكل مدرسة: {" "}
                    {schools.length
                      ? Math.round(
                          schools.reduce(
                            (sum, school) => sum + school.studentCount,
                            0
                          ) / schools.length
                        )
                      : 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-200">تقارير حديثة</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {reports.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    آخر تقرير: {" "}
                    {reports.length
                      ? format(
                          parseISO(reports[reports.length - 1].date),
                          "dd MMM yyyy",
                          { locale: ar }
                        )
                      : "غير متوفر"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-200">جداول الإرسال</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {dispatches.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    تأكد من متابعة المهل المحددة لكل مراسلة.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-200">الرسائل المحجوزة</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {drafts.filter((draft) => draft.status === "جاهز").length}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    راجع المراسلات قبل تأكيد إرسالها النهائي.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <p className="text-sm text-slate-200">مواعيد قريبة</p>
                  <p className="mt-4 text-3xl font-bold text-white">
                    {upcomingAlerts.length}
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    احرص على تجهيز الوثائق اللازمة للاجتماعات القادمة.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {activeSection === "managers" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">لوحة بيانات المديرين</h3>
                <p className="text-sm text-slate-200">
                  تحديث معلومات الاتصال والمتابعة المستمرة للمديرين.
                </p>
              </header>
              <form
                onSubmit={handleAddManager}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <input
                  name="name"
                  required
                  placeholder="الاسم الكامل"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
                <input
                  name="school"
                  required
                  placeholder="اسم المدرسة"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
                <input
                  name="phone"
                  placeholder="رقم الهاتف"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                />
                <select
                  name="status"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                >
                  <option value="نشط" className="text-black">
                    نشط
                  </option>
                  <option value="متابعة" className="text-black">
                    متابعة
                  </option>
                  <option value="إجازة" className="text-black">
                    إجازة
                  </option>
                </select>
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:from-amber-600 hover:to-amber-500"
                >
                  إضافة مدير جديد
                </button>
              </form>
              <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden rounded-2xl border border-white/10">
                  <thead className="bg-white/10 text-sm text-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                      <th className="px-4 py-3 text-right font-semibold">المدرسة</th>
                      <th className="px-4 py-3 text-right font-semibold">الهاتف</th>
                      <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {managers.map((manager) => (
                      <tr key={manager.id} className="bg-black/20">
                        <td className="px-4 py-3 text-white">{manager.name}</td>
                        <td className="px-4 py-3 text-slate-200">{manager.school}</td>
                        <td className="px-4 py-3 text-slate-200">{manager.phone}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                              manager.status === "نشط"
                                ? "bg-emerald-500/20 text-emerald-200"
                                : manager.status === "متابعة"
                                ? "bg-amber-500/20 text-amber-200"
                                : "bg-slate-500/20 text-slate-200"
                            }`}
                          >
                            {manager.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "schools" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">قاعدة بيانات الابتدائيات</h3>
                <p className="text-sm text-slate-200">
                  تتبع توزيع المدارس، مسؤوليها، وأعداد الطلبة المسجلين.
                </p>
              </header>
              <form
                onSubmit={handleAddSchool}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <input
                  name="name"
                  required
                  placeholder="اسم المدرسة"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                />
                <input
                  name="director"
                  required
                  placeholder="اسم المدير"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                />
                <input
                  name="studentCount"
                  type="number"
                  min={0}
                  placeholder="عدد التلاميذ"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                />
                <input
                  name="district"
                  placeholder="الدائرة"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/50"
                />
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 transition hover:from-emerald-600 hover:to-emerald-500"
                >
                  إضافة مدرسة
                </button>
              </form>
              <div className="grid gap-4 md:grid-cols-2">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <h4 className="text-lg font-semibold text-white">
                      {school.name}
                    </h4>
                    <p className="mt-2 text-sm text-slate-200">
                      المدير: {school.director}
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      عدد التلاميذ: {school.studentCount}
                    </p>
                    <p className="mt-1 text-sm text-slate-200">
                      الدائرة: {school.district || "غير محدد"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeSection === "reports" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">تقارير المفتشية</h3>
                <p className="text-sm text-slate-200">
                  أرشفة التقارير مع ملخص زمني للتدخلات والمتابعات.
                </p>
              </header>
              <form
                onSubmit={handleAddReport}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <input
                  name="title"
                  required
                  placeholder="عنوان التقرير"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                />
                <input
                  name="date"
                  type="date"
                  required
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                />
                <textarea
                  name="summary"
                  rows={4}
                  placeholder="ملخص التقرير"
                  className="md:col-span-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300/50"
                />
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-sky-500/30 transition hover:from-sky-600 hover:to-sky-500"
                >
                  حفظ التقرير
                </button>
              </form>
              <div className="space-y-4">
                {reports
                  .slice()
                  .reverse()
                  .map((report) => (
                    <article
                      key={report.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-200">
                        <h4 className="text-lg font-semibold text-white">
                          {report.title}
                        </h4>
                        <span>
                          {format(parseISO(report.date), "dd MMM yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-200">
                        {report.summary || "لا يوجد ملخص مفصل."}
                      </p>
                    </article>
                  ))}
              </div>
            </section>
          ) : null}

          {activeSection === "monitoring" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">متابعة المدراء</h3>
                <p className="text-sm text-slate-200">
                  إدارة خطة الزيارات ومراقبة مستوى التقدم لكل مدير.
                </p>
              </header>
              <form
                onSubmit={handleAddMonitoringEntry}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <input
                  name="manager"
                  required
                  placeholder="اسم المدير"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/50"
                />
                <input
                  name="focus"
                  required
                  placeholder="محاور المتابعة"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/50"
                />
                <select
                  name="status"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/50"
                >
                  <option value="جارٍ" className="text-black">
                    جارٍ
                  </option>
                  <option value="مكتمل" className="text-black">
                    مكتمل
                  </option>
                  <option value="متأخر" className="text-black">
                    متأخر
                  </option>
                </select>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="ملاحظات إضافية"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-300/50 md:col-span-2"
                />
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-rose-500/30 transition hover:from-rose-600 hover:to-rose-500"
                >
                  إضافة متابعة
                </button>
              </form>
              <div className="grid gap-4 md:grid-cols-2">
                {monitoringEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <div className="flex items-center justify-between text-sm text-slate-200">
                      <p className="text-base font-semibold text-white">
                        {entry.manager}
                      </p>
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                          entry.status === "مكتمل"
                            ? "bg-emerald-500/20 text-emerald-200"
                            : entry.status === "جارٍ"
                            ? "bg-amber-500/20 text-amber-100"
                            : "bg-rose-500/20 text-rose-100"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-200">
                      المحور: {entry.focus}
                    </p>
                    <p className="mt-2 text-sm text-slate-300">
                      {entry.notes || "بدون ملاحظات إضافية."}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {activeSection === "dispatch" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">جداول الإرسال</h3>
                <p className="text-sm text-slate-200">
                  تنظيم المراسلات الرسمية بين المفتش والمديرين مع تواريخ المتابعة.
                </p>
              </header>
              <form
                onSubmit={handleAddDispatch}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <input
                  name="subject"
                  required
                  placeholder="موضوع المراسلة"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                />
                <input
                  name="sentTo"
                  placeholder="الجهة المرسلة إليها"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                />
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  تاريخ الإرسال
                  <input
                    name="sendDate"
                    type="date"
                    required
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  آخر أجل للاستجابة
                  <input
                    name="dueDate"
                    type="date"
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-300/50"
                  />
                </label>
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-purple-500/30 transition hover:from-purple-600 hover:to-purple-500"
                >
                  إضافة مراسلة
                </button>
              </form>
              <div className="overflow-x-auto">
                <table className="min-w-full overflow-hidden rounded-2xl border border-white/10">
                  <thead className="bg-white/10 text-sm text-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-right font-semibold">الموضوع</th>
                      <th className="px-4 py-3 text-right font-semibold">المرسل إليه</th>
                      <th className="px-4 py-3 text-right font-semibold">تاريخ الإرسال</th>
                      <th className="px-4 py-3 text-right font-semibold">آخر أجل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {dispatches
                      .slice()
                      .reverse()
                      .map((dispatch) => (
                        <tr key={dispatch.id} className="bg-black/20">
                          <td className="px-4 py-3 text-white">{dispatch.subject}</td>
                          <td className="px-4 py-3 text-slate-200">
                            {dispatch.sentTo || "غير محدد"}
                          </td>
                          <td className="px-4 py-3 text-slate-200">
                            {dispatch.sendDate
                              ? format(parseISO(dispatch.sendDate), "dd MMM yyyy", {
                                  locale: ar,
                                })
                              : "غير معلوم"}
                          </td>
                          <td className="px-4 py-3 text-slate-200">
                            {dispatch.dueDate
                              ? format(parseISO(dispatch.dueDate), "dd MMM yyyy", {
                                  locale: ar,
                                })
                              : "غير محدد"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {activeSection === "performance" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">حاسبة المردودية</h3>
                <p className="text-sm text-slate-200">
                  احتساب مركب للمردودية بناءً على نسب النجاح وعدد الأنشطة المنفذة.
                </p>
              </header>
              <form
                onSubmit={handlePerformanceCalculation}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  إجمالي التلاميذ تحت المتابعة
                  <input
                    name="students"
                    type="number"
                    min={0}
                    required
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-300/50"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  عدد الناجحين
                  <input
                    name="successes"
                    type="number"
                    min={0}
                    required
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-300/50"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-200">
                  الأنشطة المنجزة خلال الشهر
                  <input
                    name="activities"
                    type="number"
                    min={0}
                    required
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-300/50"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-200 md:col-span-2">
                  ملاحظات نوعية
                  <textarea
                    name="observations"
                    rows={3}
                    placeholder="أهم الملاحظات الميدانية"
                    className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-300/50"
                  />
                </label>
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-lime-500 to-lime-400 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-lime-500/30 transition hover:from-lime-600 hover:to-lime-500"
                >
                  احتساب المردودية
                </button>
              </form>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-lime-200">
                  المؤشر الحالي
                </p>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-5xl font-black text-white">{performanceScore}</p>
                  <p className="text-sm text-slate-200">/ 100</p>
                </div>
                <p className="mt-4 text-sm text-slate-200">
                  {performanceScore >= 80
                    ? "أداء ممتاز يدل على فعالية المتابعة والبرامج الميدانية."
                    : performanceScore >= 60
                    ? "أداء جيد مع إمكانية تعزيز بعض الجوانب التنظيمية."
                    : "يستحسن إعداد خطة تحسين عاجلة ورفع وتيرة الأنشطة."}
                </p>
                {performanceData.observations ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-lime-400/40 bg-lime-500/10 p-4 text-sm text-lime-100">
                    <p className="font-semibold text-lime-200">ملاحظات ميدانية</p>
                    <p className="mt-1">{performanceData.observations}</p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {activeSection === "gmail" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">مركز مراسلات Gmail</h3>
                <p className="text-sm text-slate-200">
                  حفظ مسودات الرسائل، جدولة الإرسال، وتتبع حالة المراسلات الرسمية.
                </p>
              </header>
              <form
                onSubmit={handleAddDraft}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6"
              >
                <input
                  name="to"
                  required
                  placeholder="البريد المرسل إليه"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50"
                />
                <input
                  name="subject"
                  required
                  placeholder="الموضوع"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50"
                />
                <textarea
                  name="body"
                  required
                  rows={5}
                  placeholder="نص الرسالة"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50"
                />
                <div className="flex flex-col gap-2 text-sm text-slate-200 md:flex-row md:items-center md:justify-between">
                  <label className="flex flex-col gap-2">
                    جدولة الإرسال
                    <input
                      name="scheduleDate"
                      type="datetime-local"
                      className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-fuchsia-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/50"
                    />
                  </label>
                  <p className="rounded-xl bg-white/5 px-4 py-3 text-xs text-slate-200">
                    يتم تحديث حالة المسودة تلقائياً عند حلول موعد الإرسال المحدد.
                  </p>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition hover:from-fuchsia-600 hover:to-pink-600"
                >
                  حفظ المسودة
                </button>
              </form>
              <div className="space-y-4">
                {drafts
                  .slice()
                  .reverse()
                  .map((draft) => (
                    <div
                      key={draft.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-200">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-fuchsia-200">
                            إلى
                          </p>
                          <p className="text-sm text-white">{draft.to}</p>
                        </div>
                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                            draft.status === "مرسل"
                              ? "bg-emerald-500/20 text-emerald-200"
                              : "bg-fuchsia-500/20 text-fuchsia-100"
                          }`}
                        >
                          {draft.status}
                        </span>
                      </div>
                      <h4 className="mt-4 text-lg font-semibold text-white">
                        {draft.subject}
                      </h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-200">
                        {draft.body}
                      </p>
                      {draft.scheduledFor ? (
                        <p className="mt-3 text-xs text-slate-300">
                          موعد الإرسال المحجوز: {draft.scheduledFor}
                        </p>
                      ) : null}
                      {draft.sentAt ? (
                        <p className="mt-1 text-xs text-slate-300">
                          تم الإرسال في: {draft.sentAt}
                        </p>
                      ) : null}
                    </div>
                  ))}
              </div>
            </section>
          ) : null}

          {activeSection === "appointments" ? (
            <section className="space-y-6">
              <header className="border-b border-white/10 pb-6">
                <h3 className="text-2xl font-semibold">جدولة المواعيد والتنبيهات</h3>
                <p className="text-sm text-slate-200">
                  إدارة الاجتماعات والزيارات مع نظام تنبيه عند اقتراب الموعد.
                </p>
              </header>
              <form
                onSubmit={handleAddAppointment}
                className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 md:grid-cols-2"
              >
                <input
                  name="title"
                  required
                  value={appointmentForm.title}
                  onChange={(event) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      title: event.target.value,
                    }))
                  }
                  placeholder="عنوان الموعد"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50"
                />
                <input
                  name="location"
                  value={appointmentForm.location}
                  onChange={(event) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                  placeholder="مكان الاجتماع"
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50"
                />
                <input
                  name="date"
                  type="date"
                  required
                  value={appointmentForm.date}
                  onChange={(event) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      date: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50"
                />
                <input
                  name="time"
                  type="time"
                  required
                  value={appointmentForm.time}
                  onChange={(event) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      time: event.target.value,
                    }))
                  }
                  className="rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50"
                />
                <textarea
                  name="attendees"
                  rows={3}
                  value={appointmentForm.attendees}
                  onChange={(event) =>
                    setAppointmentForm((prev) => ({
                      ...prev,
                      attendees: event.target.value,
                    }))
                  }
                  placeholder="المشاركون"
                  className="md:col-span-2 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-300/50"
                />
                <button
                  type="submit"
                  className="md:col-span-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-black shadow-lg shadow-orange-500/30 transition hover:from-orange-600 hover:to-amber-600"
                >
                  إضافة موعد
                </button>
              </form>
              <div className="grid gap-4 md:grid-cols-2">
                {appointments
                  .slice()
                  .sort((a, b) => (a.date > b.date ? 1 : -1))
                  .map((appointment) => {
                    const days = differenceInDays(
                      parseISO(appointment.date),
                      new Date()
                    );
                    const isSoon = days >= 0 && days <= 3;
                    return (
                      <div
                        key={appointment.id}
                        className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${
                          isSoon ? "ring-2 ring-orange-300/70" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm text-slate-200">
                          <h4 className="text-lg font-semibold text-white">
                            {appointment.title}
                          </h4>
                          {isSoon ? (
                            <span className="rounded-lg bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-100">
                              تنبيه
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-200">
                          {format(parseISO(appointment.date), "iiii dd MMM yyyy", {
                            locale: ar,
                          })}{" "}
                          · {appointment.time}
                        </p>
                        <p className="mt-1 text-sm text-slate-200">
                          المكان: {appointment.location || "غير محدد"}
                        </p>
                        <p className="mt-2 text-sm text-slate-300">
                          المشاركون: {appointment.attendees || "غير محدد"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
