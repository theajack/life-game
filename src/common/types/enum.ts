/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 09:00:44
 * @Description: Coding something
 */
export enum WorkerMessageType {
    Test = 0,
    InitMap = 1,
    Step = 2,
    RandomInitCells = 3,
    InitCells = 4,
    Control = 5,
    TurnCell = 6,
    RandomCells = 7,
    WorkerReady = 8,
    AliveCountChange = 9,
    StepCountChange = 10,
    HistorySizeChange = 11,
    Copy,
    CopyCells,
    AddCells,
}

export enum ControlType {
    SetInterval = 0,
    Start,
    Pause,
    Step,
    Forward,
    Back,
    ForwardEnd,
    BackEnd,
    Clear,
}

export enum WasmMsgType {
    Test = 0,
    InitMap = 1,
    Step = 2,
    InitCells = 3,
    TurnCell = 6,
    Changes = 7,
    Log = 100,
}