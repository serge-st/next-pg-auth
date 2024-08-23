export async function GET(request: Request) {
    const testData = `testing data: ${process.env.POSTGRES_DB}`

    return new Response(JSON.stringify({ data: testData }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
    });
}