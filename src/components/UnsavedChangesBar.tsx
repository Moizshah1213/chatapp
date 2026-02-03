"use client";

export default function UnsavedChangesBar({
  show,
  onReset,
  onSave,
  loading,
}: any) {
  // Portal hata diya taake ye parent container ke andar hi rahe
  return (
  <div
  className={`
    /* 🔑 MAIN FIX: absolute position relative parent ke andar */
    absolute bottom-6 left-0 right-0
    z-[100] w-full px-4
    transition-all duration-300 ease-in-out
    ${show ? "opacity-100" : "opacity-0 pointer-events-none"}
  `}
  style={{ 
    transform: show ? 'translateY(0%) translateZ(0px)' : 'translateY(150%) translateZ(0px)',
    transitionTimingFunction: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)' // Discord-like bounce
  }}
>
      <div className="max-w-[700px] mx-auto bg-[#111214] p-2.5 rounded-[5px] flex items-center justify-between border border-black/40 shadow-2xl">
        <p className="text-white text-[14px] font-medium hidden sm:block ml-2">
          Careful — you have unsaved changes!
        </p>

        <div className="flex gap-4 w-full sm:w-auto justify-end items-center">
          <button
            onClick={onReset}
            className="text-white text-[13px] hover:underline transition px-2"
          >
            Reset
          </button>

          <button
            onClick={onSave}
            disabled={loading}
            className="bg-[#23a559] hover:bg-[#1a8344] active:scale-95 text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition flex items-center gap-2"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}