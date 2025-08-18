export default function Checkbox({
  people,
  statusFilter,
  setStatusFilter,
}: any) {
  const handleChange = (data: string) => {
    setStatusFilter((prevData: string[]) => {
      if (prevData.includes(data)) {
        return prevData.filter((item) => item !== data);
      } else {
        return [...prevData, data];
      }
    });
  };

  return (
    <div className="mt-4 divide-y divide-gray-200 border-t border-b border-gray-200 bg-white absolute rounded-md shadow-md ">
      {people.map((person: any, personIdx: number) => (
        <div
          key={personIdx}
          className="relative flex items-center justify-between gap-3 py-3 px-4 hover:bg-gray-50 transition-colors"
        >
          <label
            htmlFor={`person-${person.id}`}
            className="font-medium text-gray-800 select-none cursor-pointer"
          >
            {person.name}
          </label>

          {/* Custom checkbox with tick */}
          <div className="flex h-6 shrink-0 items-center">
            <div className="relative grid size-5 grid-cols-1">
              <input
                checked={statusFilter.includes(person.value)}
                id={`person-${person.id}`}
                name={`person-${person.id}`}
                type="checkbox"
                className="peer col-start-1 row-start-1 appearance-none rounded-md border border-gray-300 bg-white 
                  checked:border-indigo-600 checked:bg-indigo-600 
                  transition-all duration-200 ease-in-out
                  hover:shadow-sm
                  focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                onChange={() => handleChange(person.value)}
              />
              <svg
                fill="none"
                viewBox="0 0 14 14"
                className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white transition-opacity duration-200 opacity-0 peer-checked:opacity-100"
              >
                <path
                  d="M3 8L6 11L11 3.5"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
