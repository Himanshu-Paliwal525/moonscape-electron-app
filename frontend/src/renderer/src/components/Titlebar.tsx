import closeSvg from "../assets/close.svg";
import minimize from "../assets/minimize.svg";
import max from "../assets/max.svg";
const Titlebar = () => {
    const closeWindow = () => {
        window.electron.ipcRenderer.send("close-window");
    };
    const minimizeWindow = () => {
        window.electron.ipcRenderer.send("minimize");
    };
    const maximizeWindow = () => {
        window.electron.ipcRenderer.send("maximize");
    };
    return (
        <div
            className=" w-full flex justify-between items-center fixed top-0 z-20 bg-slate-300"
            style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
            <h1 className="font-semibold text-gray-900 text-sm ml-4">
                Moonscape
            </h1>
            <div className="justify-end flex items-cen">
                <img
                    src={max}
                    alt=""
                    onClick={minimizeWindow}
                    className="h-[36px] px-4 py-2 hover:invert hover:bg-cyan-400 transition-all duration-100"
                    style={
                        { WebkitAppRegion: "no-drag" } as React.CSSProperties
                    }
                />
                <img
                    src={minimize}
                    alt=""
                    onClick={maximizeWindow}
                    className="h-[36px] px-4 py-[10px] hover:invert hover:bg-cyan-400 transition-all duration-100"
                    style={
                        { WebkitAppRegion: "no-drag" } as React.CSSProperties
                    }
                />
                <img
                    src={closeSvg}
                    alt=""
                    className="h-[36px] px-[19px] py-[11px] object-contain hover:invert hover:bg-cyan-400 transition-all duration-100"
                    onClick={closeWindow}
                    style={
                        { WebkitAppRegion: "no-drag" } as React.CSSProperties
                    }
                />
            </div>
        </div>
    );
};

export default Titlebar;
