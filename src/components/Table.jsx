import { classNames } from "@/utils";
import { motion } from "framer-motion";
import { Icon } from "@/components/Icon";

function Table({
  columns,
  data,
  isLoading,
  emptyMessage = "No records found.",
  rowClassName,
}) {
  if (isLoading) {
    return (
      <div className="flex h-60 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent shadow-glow"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center text-slate-400">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
          <Icon name="faFolderOpen" className="text-2xl text-slate-200" />
        </div>
        <p className="font-bold tracking-widest uppercase text-[10px]">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full scrollbar-hide">
      <table className="w-full text-left border-separate border-spacing-y-3 min-w-[800px]">
        <thead>
          <tr className="text-slate-400">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="before:block before:h-2">
          {data.map((row, rowIdx) => (
            <motion.tr
              key={row.id ?? rowIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIdx * 0.03 }}
              className={classNames(
                "group bg-white hover:bg-slate-50/50 transition-all duration-300 shadow-sm hover:shadow-md",
                typeof rowClassName === "function"
                  ? rowClassName(row, rowIdx)
                  : rowClassName,
              )}
            >
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={classNames(
                    "px-6 py-5 text-sm font-bold text-slate-700 first:rounded-l-3xl last:rounded-r-3xl first:border-l last:border-r border-y border-slate-100/80 transition-all group-hover:border-brand-500/20",
                  )}
                >
                  {col.render ? col.render(row) : row[col.accessor]}
                </td>
              ))}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
