export default function AnimatedStep({ text }) {
    return (
      <div className="my-2 text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
        <div className="w-2 h-2 mt-1.5 rounded-full bg-[#612D91] animate-pulse"></div>
        <div className="animate-fadeIn">{text}</div>
      </div>
    );
  }
  