import { useState } from 'react';
import { Settings, Bell, BellOff, Clock, Volume2, BookOpen } from 'lucide-react';
import Modal from './Modal';
import { notificationsSupported, requestPermission, playAdhan, stopAdhan } from '../services/notifications';
import { toDateKey } from '../utils/dateUtils';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const REMINDERS = [0, 5, 10, 15, 30];
const GOALS = [7, 10, 15, 20, 30, 60];

const Section = ({ icon: Icon, title, children }) => (
    <section className="rounded-2xl bg-white/5 border border-white/10 p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Icon size={18} className="text-emerald-400" />{title}</h3>
        <div className="space-y-3">{children}</div>
    </section>
);

const Toggle = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between gap-3 cursor-pointer">
        <span className="text-sm text-white/85">{label}</span>
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-emerald-500' : 'bg-white/20'}`}
            dir="ltr"
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
        </button>
    </label>
);

const Segmented = ({ options, value, onChange }) => (
    <div className="flex flex-wrap gap-1 bg-black/20 p-1 rounded-xl">
        {options.map(o => (
            <button
                key={o.value}
                onClick={() => onChange(o.value)}
                className={`flex-1 min-w-[3rem] py-1.5 px-2 rounded-lg text-sm transition-colors ${value === o.value ? 'bg-emerald-500/80 text-white' : 'text-white/60 hover:bg-white/10'}`}
            >
                {o.label}
            </button>
        ))}
    </div>
);

const SettingsView = ({ onClose, settings, update, t }) => {
    const [permission, setPermission] = useState(
        notificationsSupported() ? Notification.permission : 'unsupported'
    );

    const enableNotifications = async () => {
        const result = await requestPermission();
        setPermission(result);
        if (result === 'granted') update({ notificationsEnabled: true });
    };

    const canNotify = permission === 'granted';

    return (
        <Modal title={t.settings} icon={Settings} onClose={() => { stopAdhan(); onClose(); }}>
            <div className="space-y-4 pb-2">
                <Section icon={Clock} title={t.timeFormat}>
                    <Segmented
                        value={settings.use24h}
                        onChange={(v) => update({ use24h: v })}
                        options={[
                            { value: false, label: <>{t.h12} · <span dir="ltr">5:34 PM</span></> },
                            { value: true, label: <>{t.h24} · <span dir="ltr">17:34</span></> },
                        ]}
                    />
                </Section>

                <Section icon={Bell} title={t.notifications}>
                    {permission === 'unsupported' ? (
                        <p className="text-sm text-white/60">{t.notificationsUnsupported}</p>
                    ) : permission === 'denied' ? (
                        <p className="text-sm text-amber-200/90 flex items-center gap-2"><BellOff size={16} />{t.notificationsBlocked}</p>
                    ) : !canNotify ? (
                        <button onClick={enableNotifications} className="w-full py-2.5 rounded-xl bg-emerald-500/80 hover:bg-emerald-500 font-semibold">
                            {t.enableNotifications}
                        </button>
                    ) : (
                        <Toggle
                            label={t.enableNotifications}
                            checked={settings.notificationsEnabled}
                            onChange={(v) => update({ notificationsEnabled: v })}
                        />
                    )}

                    {canNotify && settings.notificationsEnabled && (
                        <>
                            <div className="grid grid-cols-1 gap-2 ps-1">
                                {PRAYERS.map(p => (
                                    <Toggle
                                        key={p}
                                        label={t[p.toLowerCase()]}
                                        checked={settings.notify[p]}
                                        onChange={(v) => update(prev => ({ notify: { ...prev.notify, [p]: v } }))}
                                    />
                                ))}
                            </div>
                            <div>
                                <p className="text-sm text-white/70 mb-1.5">{t.reminderBefore}</p>
                                <Segmented
                                    value={settings.reminderMinutes}
                                    onChange={(v) => update({ reminderMinutes: v })}
                                    options={REMINDERS.map(m => ({ value: m, label: m ? <span dir="ltr">{m} {t.minutesShort}</span> : t.off }))}
                                />
                            </div>
                        </>
                    )}
                    <p className="text-xs text-white/45">{t.notifyWhileOpen}</p>
                </Section>

                <Section icon={Volume2} title={t.sound}>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <Toggle label={t.sound} checked={settings.sound} onChange={(v) => update({ sound: v })} />
                        </div>
                        <button onClick={playAdhan} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm">{t.testSound}</button>
                    </div>
                </Section>

                <Section icon={BookOpen} title={t.khatmahGoal}>
                    <div>
                        <p className="text-sm text-white/70 mb-1.5">{t.finishIn}</p>
                        <Segmented
                            value={settings.khatmahDays}
                            onChange={(v) => update({ khatmahDays: v, khatmahStart: toDateKey(new Date()) })}
                            options={GOALS.map(d => ({ value: d, label: <span dir="ltr">{d}</span> }))}
                        />
                        <p className="text-xs text-white/45 mt-1">{settings.khatmahDays} {t.days}</p>
                    </div>
                    <Toggle
                        label={t.weeklyReminder}
                        checked={settings.khatmahReminder.enabled}
                        onChange={(v) => {
                            if (v && !canNotify) enableNotifications();
                            update(prev => ({ khatmahReminder: { ...prev.khatmahReminder, enabled: v }, notificationsEnabled: v || prev.notificationsEnabled }));
                        }}
                    />
                    {settings.khatmahReminder.enabled && (
                        <div className="flex items-center gap-2 text-sm">
                            <select
                                value={settings.khatmahReminder.weekday}
                                onChange={(e) => update(prev => ({ khatmahReminder: { ...prev.khatmahReminder, weekday: Number(e.target.value) } }))}
                                className="flex-1 bg-white/10 border border-white/15 rounded-lg px-2 py-1.5"
                            >
                                {t.weekdays.map((w, i) => <option key={i} value={i} className="bg-slate-800">{w}</option>)}
                            </select>
                            <span className="text-white/60">{t.at}</span>
                            <input
                                type="time"
                                dir="ltr"
                                value={settings.khatmahReminder.time}
                                onChange={(e) => e.target.value && update(prev => ({ khatmahReminder: { ...prev.khatmahReminder, time: e.target.value } }))}
                                className="bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 [color-scheme:dark]"
                            />
                        </div>
                    )}
                    <Toggle
                        label={t.qDailyWird}
                        checked={settings.wirdReminder.enabled}
                        onChange={(v) => {
                            if (v && !canNotify) enableNotifications();
                            update(prev => ({ wirdReminder: { ...prev.wirdReminder, enabled: v }, notificationsEnabled: v || prev.notificationsEnabled }));
                        }}
                    />
                    {settings.wirdReminder.enabled && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-white/60">{t.at}</span>
                            <input
                                type="time"
                                dir="ltr"
                                value={settings.wirdReminder.time}
                                onChange={(e) => e.target.value && update(prev => ({ wirdReminder: { ...prev.wirdReminder, time: e.target.value } }))}
                                className="bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 [color-scheme:dark]"
                            />
                        </div>
                    )}
                </Section>
            </div>
        </Modal>
    );
};

export default SettingsView;
