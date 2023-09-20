export default function LoadingSpinner() {
    return (
        <div className="flex h-14 w-14 relative items-center justify-center rounded-full bg-gradient-to-tr from-[#FF386B] to-[#A34FDE] animate-spin">
            <div className="h-10 w-10 rounded-full bg-[#181818]"></div>
        </div>
    )
}