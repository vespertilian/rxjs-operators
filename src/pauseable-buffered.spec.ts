import {Subject} from "rxjs";
import {pauseableBuffered, PauseableState} from "./pauseable-buffered";

const lastArrayItem = <T>(array: T[]): T | undefined => array[array.length - 1]

describe('pauseableBuffer', function () {
    it('starts off paused (by default) allows you to play and resume the stream', () => {
        const stream$ = new Subject<number>()
        const playPause$ = new Subject<PauseableState>()

        const result: number[] = []
        const last = (): number | undefined => lastArrayItem(result)

        const sub = stream$.pipe(pauseableBuffered(playPause$))
            .subscribe((v) => result.push(v))

        stream$.next(1)
        stream$.next(2)
        expect(result.length).toEqual(0)
        expect(last()).toEqual(undefined)

        playPause$.next('playing')
        expect(result.length).toEqual(2)
        expect(last()).toEqual(2)

        playPause$.next('paused')
        stream$.next(3)
        stream$.next(4)
        expect(result.length).toEqual(2)

        playPause$.next('playing')
        expect(result.length).toEqual(4)
        expect(last()).toEqual(4)
        stream$.next(5)
        expect(result.length).toEqual(5)
        expect(last()).toEqual(5)

        playPause$.next('paused')
        stream$.next(6)
        expect(result.length).toEqual(5)
        expect(last()).toEqual(5)

        playPause$.next('playing')
        expect(result.length).toEqual(6)
        expect(last()).toEqual(6)

        playPause$.complete()
        stream$.next(7)
        expect(result.length).toEqual(7)
        expect(last()).toEqual(7)

        sub.unsubscribe()
    })

    it('allows you to start it playing ', () => {
        const stream$ = new Subject<number>()
        const playPause$ = new Subject<PauseableState>()

        const result: number[] = []
        const last = (): number | undefined => lastArrayItem(result)

        const sub = stream$.pipe(pauseableBuffered(playPause$))
            .subscribe((v) => result.push(v))
        playPause$.next('playing')

        stream$.next(1)
        stream$.next(2)
        expect(result.length).toEqual(2)
        expect(last()).toEqual(2)

        playPause$.next('paused')
        stream$.next(3)
        stream$.next(4)

        expect(result.length).toEqual(2)
        expect(last()).toEqual(2)
        playPause$.next('playing')
        expect(result.length).toEqual(4)
        expect(last()).toEqual(4)

        sub.unsubscribe()
    })
});