export class GridEngine {
    private static engine: GridEngine | null = null

    public static getInstance() {
        if (!GridEngine.engine) GridEngine.engine = new GridEngine();
        return GridEngine.engine
    }
}