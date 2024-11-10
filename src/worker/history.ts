/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-10 10:48:50
 * @Description: Coding something
 */

export class History<T> {

    step = 0;
    private Max = 40; // 最多存储40步
    list: T[] = [];
    private historyIndex = 0;

    onStepChange: ()=>void;
    onHistorySizeChange: (size: number) => void;

    constructor ({
        onStepChange,
        onHistorySizeChange,
    }: {
        onStepChange: (step: number) => void
        onHistorySizeChange: (size: number) => void
    }) {
        this.onStepChange = () => onStepChange(this.step);
        this.onHistorySizeChange = onHistorySizeChange;
        this.onStepChange();
    }

    setMax (historyMax: number) {
        this.Max = historyMax;
    }

    private setStep (step: number) {
        this.step = step;
        this.onStepChange();
    }

    private setHistoryIndex (index: number) {
        this.historyIndex = index;
        this.onHistorySizeChange(index);
    }

    prev () {
        if (this.historyIndex === 0) {
            return null;
        }
        this.setHistoryIndex(this.historyIndex - 1);
        this.setStep(this.step - 1);
        return this.list[this.historyIndex];
    }

    next () {
        if (this.historyIndex === this.list.length) {
            return null;
        }
        this.setStep(this.step + 1);
        const item = this.list[this.historyIndex];
        this.setHistoryIndex(this.historyIndex + 1);
        return item;
    }

    forward (data: T) {
        const n = this.list.length;

        if (this.historyIndex < n) {
            // 在历史记录中, 则移除旧记录，开辟新记录
            this.list.splice(this.historyIndex);
        }

        if (this.list.length >= this.Max) {
            this.list.shift();
        } else {
            this.setHistoryIndex(this.historyIndex + 1);
        }
        // console.log('receive change', this.list, this.historyIndex, data);
        this.list.push(data);
        this.setStep(this.step + 1);
    }

    clear () {
        this.list = [];
        this.setHistoryIndex(0);
        this.setStep(0);
    }

}