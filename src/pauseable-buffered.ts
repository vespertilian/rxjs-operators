import {
    bufferToggle,
    distinctUntilChanged,
    filter,
    merge,
    mergeMap,
    Observable, share,
    startWith,
    tap,
    windowToggle
} from "rxjs";

export type PauseableState = 'paused' | 'playing'
export function pauseableBuffered(pauser: Observable<PauseableState>) {
    return function _pauseableBuffer<T>(source: Observable<T>): Observable<T> {
        const _pauser$ = pauser.pipe(startWith('paused'), distinctUntilChanged(), share())
        const paused$ = _pauser$.pipe(filter((v) => v === 'paused'))
        const playing$ = _pauser$.pipe(filter((v) => v === 'playing'))

        const buffer$ = source.pipe(bufferToggle(paused$, () => playing$))
        const window$ = source.pipe(windowToggle(playing$, () => paused$))

        return merge(
            buffer$,
            window$,
        ).pipe(mergeMap(v => v))
    }
}