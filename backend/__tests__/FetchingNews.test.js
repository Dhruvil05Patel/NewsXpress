const fetch = require("node-fetch");
const { fetchNews, fetchNewsBySerpAPI } = require("../FetchingNews");

jest.mock("node-fetch");
const { Response } = jest.requireActual("node-fetch");

describe("fetchNewsBySerpAPI()", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns mapped article list on success", async () => {
    const mockApiResponse = {
      news_results: [
        {
          title: "Test Title",
          link: "https://example.com",
          source: { name: "India Today" },
          date: "2024-01-01",
          snippet: "Some snippet...",
          thumbnail: "https://img.com/1.jpg",
          position: 1
        }
      ]
    };

    fetch.mockResolvedValue(
      new Response(JSON.stringify(mockApiResponse))
    );

    const result = await fetchNewsBySerpAPI("India news", 10);

    expect(result).toEqual([
      {
        title: "Test Title",
        link: "https://example.com",
        source: "India Today",
        date: "2024-01-01",
        snippet: "Some snippet...",
        thumbnail: "https://img.com/1.jpg",
        position: 1,
      }
    ]);

    expect(fetch).toHaveBeenCalledTimes(1);
  });


  test("returns [] when SerpAPI returns error", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Invalid key" }))
    );

    const result = await fetchNewsBySerpAPI("sports", 5);
    expect(result).toEqual([]);
  });


  test("returns [] when no news_results exist", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ news_results: [] }))
    );

    const result = await fetchNewsBySerpAPI("empty", 5);
    expect(result).toEqual([]);
  });


  test("returns [] on fetch exception", async () => {
    fetch.mockRejectedValue(new Error("Network down"));

    const result = await fetchNewsBySerpAPI("breaking", 5);
    expect(result).toEqual([]);
  });


  test("constructs correct SerpAPI URL", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ news_results: [] }))
    );

    await fetchNewsBySerpAPI("tech", 20);

    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain("engine=google_news");
    expect(calledUrl).toContain("q=tech");
    expect(calledUrl).toContain("gl=in");
    expect(calledUrl).toContain("hl=en");
    expect(calledUrl).toContain("num=20");
    expect(calledUrl).toContain("api_key=");
  });
});


describe("fetchNews()", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("uses 'India latest news' for category = all", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ news_results: [] }))
    );

    await fetchNews("all", 15);

    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain("q=India+latest+news");


  });

  test("uses category-specific query", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ news_results: [] }))
    );

    await fetchNews("business", 15);

    const calledUrl = fetch.mock.calls[0][0];
    expect(calledUrl).toContain("q=India+business+news");

  });

  test("returns [] if fetchNewsBySerpAPI returns []", async () => {
    fetch.mockResolvedValue(
      new Response(JSON.stringify({ news_results: [] }))
    );

    const result = await fetchNews("health", 3);
    expect(result).toEqual([]);
  });

  test("returns [] on unexpected exception", async () => {
    fetch.mockRejectedValue(new Error("Unexpected failure"));

    const result = await fetchNews("sports", 10);
    expect(result).toEqual([]);
  });

});
