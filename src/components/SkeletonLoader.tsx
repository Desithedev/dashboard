/**
 * Skeleton loader with shimmer effect for loading states.
 * Dark mode glassmorphism style.
 */

export const shimmerStyle = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`

function Bone({ width = '100%', height = 16, radius = 8, className = '' }: { width?: string | number; height?: number; radius?: number; className?: string }) {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius: radius,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <Bone width="40%" height={12} className="mb-3" />
      <Bone width="60%" height={24} className="mb-2" />
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <Bone key={i} width={`${70 - i * 15}%`} height={12} className="mb-2" />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0' }}>
      <Bone width={32} height={32} radius={8} />
      <div style={{ flex: 1 }}>
        <Bone width="50%" height={14} className="mb-2" />
        <Bone width="30%" height={10} />
      </div>
      <Bone width={60} height={20} radius={10} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={180} height={28} className="mb-2" />
      <Bone width={300} height={14} className="mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="50%" height={14} className="mb-4" />
            {[1, 2, 3].map(j => <SkeletonRow key={j} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export function AgentsSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={140} height={28} className="mb-2" />
      <Bone width={280} height={14} className="mb-6" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => <Bone key={i} width={120} height={36} radius={12} />)}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 32 }}>
        <SkeletonCard lines={2} />
        <Bone width={1} height={32} radius={0} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  )
}

export function IntelligenceSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={160} height={28} className="mb-4" />
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <Bone height={40} radius={8} />
        <Bone width={80} height={40} radius={8} />
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 320, flexShrink: 0 }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <Bone width="30%" height={10} className="mb-2" />
              <Bone width="80%" height={14} className="mb-1" />
              <Bone width="40%" height={10} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          <Bone width="20%" height={12} className="mb-4" />
          <Bone width="70%" height={24} className="mb-4" />
          <Bone width="100%" height={14} className="mb-2" />
          <Bone width="90%" height={14} className="mb-2" />
          <Bone width="95%" height={14} className="mb-2" />
        </div>
      </div>
    </div>
  )
}

export function ApiUsageSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={140} height={28} className="mb-2" />
      <Bone width={280} height={14} className="mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="40%" height={14} className="mb-4" />
            <Bone width="100%" height={160} radius={8} />
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
        <Bone width="30%" height={14} className="mb-4" />
        {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
      </div>
    </div>
  )
}

export function ClientsSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={120} height={28} className="mb-2" />
      <Bone width={240} height={14} className="mb-6" />
      <Bone width="100%" height={44} radius={12} className="mb-6" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Bone width={48} height={48} radius={12} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Bone width="40%" height={16} />
                  <Bone width={60} height={20} radius={10} />
                </div>
                <Bone width="70%" height={12} className="mb-2" />
                <div style={{ display: 'flex', gap: 6 }}>
                  <Bone width={56} height={18} radius={4} />
                  <Bone width={56} height={18} radius={4} />
                  <Bone width={56} height={18} radius={4} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CommunicationSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={160} height={28} className="mb-2" />
      <Bone width={260} height={14} className="mb-8" />
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 240, flexShrink: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
          <Bone width="60%" height={14} className="mb-4" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ padding: '8px', marginBottom: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Bone width={8} height={8} radius={4} />
                <Bone width="70%" height={12} />
              </div>
              <Bone width="40%" height={10} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
          <Bone width="50%" height={14} className="mb-4" />
          <div style={{ flex: 1 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: 12, display: 'flex', justifyContent: i % 2 === 0 ? 'flex-end' : 'flex-start' }}>
                <Bone width="55%" height={56} radius={12} />
              </div>
            ))}
          </div>
          <Bone width="100%" height={44} radius={10} />
        </div>
      </div>
    </div>
  )
}

export function DocumentsSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={140} height={28} className="mb-2" />
      <Bone width={240} height={14} className="mb-6" />
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1 }}><Bone height={44} radius={12} /></div>
        <Bone width={160} height={44} radius={12} />
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Bone width={14} height={14} radius={4} />
            <div style={{ flex: 2 }}><Bone width="75%" height={14} /></div>
            <div style={{ flex: 1 }}><Bone width="55%" height={12} /></div>
            <div style={{ flex: 1 }}><Bone width="50%" height={12} /></div>
            <div style={{ flex: 1 }}><Bone width="60%" height={12} /></div>
            <div style={{ flex: 2 }}><Bone width="65%" height={12} /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function EvalsSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={160} height={28} className="mb-2" />
      <Bone width={240} height={14} className="mb-6" />
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Bone width={160} height={44} radius={12} />
        <Bone width={120} height={44} radius={12} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <Bone width={40} height={40} radius={8} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Bone width="35%" height={14} />
                  <Bone width={60} height={18} radius={4} />
                </div>
                <Bone width="80%" height={12} className="mb-1" />
                <Bone width="55%" height={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SettingsSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[1, 2, 3, 4].map(i => <Bone key={i} width={120} height={44} radius={12} />)}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
        <Bone width="30%" height={16} className="mb-4" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Bone width="30%" height={12} />
            <Bone width="20%" height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}

export function UploadSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={120} height={28} className="mb-2" />
      <Bone width={280} height={14} className="mb-6" />
      <Bone width="100%" height={180} radius={12} className="mb-6" />
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Bone width="30%" height={14} />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Bone width={16} height={16} radius={4} />
            <div style={{ flex: 1 }}>
              <Bone width="50%" height={12} className="mb-1" />
              <Bone width="30%" height={10} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WeeklyRecapSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={140} height={28} className="mb-2" />
      <Bone width={200} height={14} className="mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[1, 2].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="40%" height={14} className="mb-4" />
            {[1, 2, 3, 4].map(j => <SkeletonRow key={j} />)}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
        <Bone width="30%" height={14} className="mb-4" />
        {[1, 2, 3, 4, 5, 6, 7].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <Bone width={80} height={12} />
            <div style={{ flex: 1 }}>
              <Bone width={`${Math.min(20 + i * 12, 90)}%`} height={28} radius={4} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WorkshopSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <Bone width={120} height={28} className="mb-2" />
      <Bone width={240} height={14} className="mb-6" />
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="30%" height={14} className="mb-4" />
            <Bone width="100%" height={200} radius={8} className="mb-4" />
            <div style={{ display: 'flex', gap: 12 }}>
              <Bone width={120} height={44} radius={12} />
              <Bone width={160} height={44} radius={12} />
              <Bone width={100} height={44} radius={12} />
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="20%" height={14} className="mb-4" />
            <Bone width="100%" height={120} radius={8} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="50%" height={14} className="mb-4" />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ marginBottom: 8 }}>
                <Bone width="100%" height={60} radius={8} />
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 20 }}>
            <Bone width="60%" height={14} className="mb-4" />
            {[1, 2].map(i => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── TasksSkeleton ───────────────────────────────────────────── */
export function TasksSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Bone width={140} height={28} className="mb-2" />
          <Bone width={260} height={13} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Bone width={110} height={40} radius={12} />
          <Bone width={110} height={40} radius={12} />
          <Bone width={110} height={40} radius={12} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <Bone height={44} radius={12} />
        <Bone width={100} height={44} radius={12} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[0,1,2,3].map(i => <SkeletonCard key={i} lines={2} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[0,1,2].map(colIdx => (
          <div key={colIdx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Bone width={80} height={12} />
              <Bone width={28} height={20} radius={10} />
            </div>
            {[0,1,2,3].map(r => (
              <div key={r} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 14, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Bone width={32} height={32} radius={8} />
                  <div style={{ flex: 1 }}>
                    <Bone width={`${60 - r * 8}%`} height={13} className="mb-1" />
                    <Bone width="35%" height={10} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── JournalSkeleton ─────────────────────────────────────────── */
export function JournalSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <Bone width={130} height={28} className="mb-2" />
          <Bone width={220} height={13} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Bone width={90} height={36} radius={10} />
          <Bone width={90} height={36} radius={10} />
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ width: 240, flexShrink: 0, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 16 }}>
          <Bone width="60%" height={12} className="mb-3" />
          {[0,1,2,3,4,5,6,7].map(i => (
            <div key={i} style={{ padding: '10px 8px', marginBottom: 4, borderRadius: 8 }}>
              <Bone width="35%" height={10} className="mb-1" />
              <Bone width={`${70 - (i % 3) * 15}%`} height={13} />
            </div>
          ))}
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: 24 }}>
          <Bone width="25%" height={12} className="mb-2" />
          <Bone width="60%" height={22} className="mb-5" />
          <Bone width="20%" height={11} className="mb-3" />
          {[0,1,2,3].map(i => <Bone key={i} width={`${90 - i * 8}%`} height={12} className="mb-2" />)}
          <div className="mt-6">
            <Bone width="25%" height={11} className="mb-3" />
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <Bone width={28} height={28} radius={7} />
                <div style={{ flex: 1 }}>
                  <Bone width="50%" height={13} className="mb-1" />
                  <Bone width="30%" height={10} />
                </div>
                <Bone width={50} height={18} radius={9} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── SkillsSkeleton ──────────────────────────────────────────── */
export function SkillsSkeleton() {
  return (
    <div>
      <style>{shimmerStyle}</style>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Bone width={180} height={28} />
        <div style={{ display: 'flex', gap: 8 }}>
          <Bone width={80} height={36} radius={10} />
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 4 }}>
            {[130, 110, 100].map((w, i) => <Bone key={i} width={w} height={36} radius={10} />)}
          </div>
        </div>
      </div>
      <Bone width={280} height={13} className="mb-6" />
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Bone width={160} height={44} radius={12} />
        <Bone height={44} radius={12} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Bone width={20} height={20} radius={4} />
                <Bone width={90} height={14} />
              </div>
              <Bone width={55} height={18} radius={9} />
            </div>
            <Bone width="90%" height={11} className="mb-1" />
            <Bone width="70%" height={11} className="mb-3" />
            <Bone width={70} height={18} radius={9} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Bone
