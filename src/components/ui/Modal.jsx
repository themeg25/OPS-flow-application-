import { useEffect } from 'react';

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'max-w-[1400px]',
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Prevent the page behind the modal from scrolling
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 lg:p-5">

      {/* Background overlay */}
      <div
        className="
          absolute
          inset-0
          bg-slate-900/45
          backdrop-blur-[3px]
        "
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative
          w-full
          ${width}

          max-h-[96vh]

          flex
          flex-col

          overflow-hidden

          bg-white

          rounded-[18px]

          border
          border-emerald-200

          shadow-[0_25px_70px_rgba(15,23,42,0.28)]

          ring-1
          ring-emerald-100
        `}
      >

        {/* ================================
            TOP / HEADER
        ================================= */}
        <div
          className="
            shrink-0

            flex
            items-center
            justify-between

            px-5
            py-4
            sm:px-7
            sm:py-5

            border-b
            border-emerald-200

            bg-gradient-to-r
            from-emerald-100
            via-emerald-50
            to-white
          "
        >

          {/* Title */}
          <div className="flex items-center gap-3">

            <div
              className="
                w-1.5
                h-8
                rounded-full
                bg-emerald-500
                shrink-0
              "
            />

            <h3
              className="
                text-lg
                sm:text-xl
                font-semibold
                text-slate-900
                tracking-tight
              "
            >
              {title}
            </h3>

          </div>


          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="
              w-9
              h-9

              flex
              items-center
              justify-center

              rounded-lg

              bg-red-50

              border
              border-red-200

              text-red-300
              text-xl
              leading-none

              transition-all
              duration-150

              hover:bg-red-600
              hover:border-red-700
              hover:text-white

              focus:outline-none
              focus:ring-2
              focus:ring-red-200
            "
          >
            ×
          </button>

        </div>


        {/* ================================
            MAIN CONTENT
        ================================= */}
        <div
          className="
            flex-1
            min-h-0

            overflow-y-auto

            px-5
            py-5

            sm:px-7
            sm:py-6

            bg-white
          "
        >
          {children}
        </div>


        {/* ================================
            BOTTOM / FOOTER
        ================================= */}
        {footer && (
          <div
            className="
              shrink-0

              flex
              flex-col-reverse
              sm:flex-row
              sm:items-center
              sm:justify-end

              gap-2
              sm:gap-3

              px-5
              py-4

              sm:px-7
              sm:py-4

              border-t
              border-emerald-200

              bg-gradient-to-r
              from-white
              via-emerald-50
              to-emerald-100/60
            "
          >
            {footer}
          </div>
        )}

      </div>
    </div>
  );
}