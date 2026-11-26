using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Единый сетевой мост Unity <-> NestJS (совместим с github.com/newbshark/unity-backend-starter v2).
/// Поддерживает GET и POST запросы без сторонних библиотек.
/// </summary>
public class ServerBridge : MonoBehaviour
{
    private static ServerBridge _instance;
    public static ServerBridge Instance
    {
        get
        {
            if (_instance == null)
            {
                GameObject go = new GameObject("ServerBridge_AutoCreated");
                _instance = go.AddComponent<ServerBridge>();
                DontDestroyOnLoad(go);
            }
            return _instance;
        }
    }

    [Header("Подключение к облаку класса")]
    public string baseUrl = "https://vox-auspex-citadel-production.up.railway.app";

    [Header("Состояние (видно в Inspector)")]
    public bool isConnected = false;
    public string lastServerMessage = "Ожидание запроса...";

    private void Awake()
    {
        if (_instance != null && _instance != this)
        {
            Destroy(gameObject);
            return;
        }
        _instance = this;
        DontDestroyOnLoad(gameObject);
    }

    [Serializable]
    public struct ServerStatusResponse
    {
        public string status;
        public int uptimeSeconds;
        public string serverTime;
        public string protocolVersion;
        public int activePlayers;
    }

    [Serializable]
    public struct MotdResponse
    {
        public string title;
        public string motd;
        public float expMultiplier;
    }

    [Serializable]
    public struct WorldStateResponse
    {
        public string title;
        public string motd;
        public float expMultiplier;
        public float cubeScale;
        public float gravityY;
        public string cubeColorHex;
        public bool lowGravity;
    }

    [Serializable]
    public struct BossStateResponse
    {
        public string bossName;
        public int hp;
        public int maxHp;
        public int defeatedCount;
        public string lastAttacker;
        public string lastEvent;
    }

    [Serializable]
    public struct LootResponse
    {
        public string itemName;
        public string rarity;
        public int bonusScore;
        public string colorHex;
        public string message;
    }

    [Serializable]
    public struct CoinResponse
    {
        public bool accepted;
        public string player;
        public int coins;
        public int cheatAttempts;
        public string message;
    }

    [Serializable]
    public struct LeaderboardResponse
    {
        public string topSummary;
    }

    [Serializable]
    private struct BossHitBody
    {
        public string player;
        public int damage;
    }

    [Serializable]
    private struct PlayerBody
    {
        public string player;
    }

    [Serializable]
    private struct CoinBody
    {
        public string player;
        public int amount;
    }

    public void GetServerStatus(Action<ServerStatusResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest("/server/status", onSuccess, onError));
    }

    public void GetMotd(Action<MotdResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest("/server/motd", onSuccess, onError));
    }

    public void GetWorldState(Action<WorldStateResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest("/server/world", onSuccess, onError));
    }

    public void GetBoss(Action<BossStateResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest("/game/boss", onSuccess, onError));
    }

    public void HitBoss(string player, int damage, Action<BossStateResponse> onSuccess, Action<string> onError = null)
    {
        string json = JsonUtility.ToJson(new BossHitBody { player = player, damage = damage });
        StartCoroutine(SendPostRequest("/game/boss/hit", json, onSuccess, onError));
    }

    public void OpenLootChest(string player, Action<LootResponse> onSuccess, Action<string> onError = null)
    {
        string json = JsonUtility.ToJson(new PlayerBody { player = player });
        StartCoroutine(SendPostRequest("/game/loot", json, onSuccess, onError));
    }

    public void CollectCoin(string player, int amount, Action<CoinResponse> onSuccess, Action<string> onError = null)
    {
        string json = JsonUtility.ToJson(new CoinBody { player = player, amount = amount });
        StartCoroutine(SendPostRequest("/game/coin", json, onSuccess, onError));
    }

    public void GetLeaderboard(Action<LeaderboardResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest("/game/leaderboard", onSuccess, onError));
    }

    private IEnumerator SendGetRequest<T>(string endpoint, Action<T> onSuccess, Action<string> onError)
    {
        string fullUrl = baseUrl.TrimEnd('/') + endpoint;
        using (UnityWebRequest req = UnityWebRequest.Get(fullUrl))
        {
            req.timeout = 6;
            yield return req.SendWebRequest();
            HandleResponse(endpoint, req, onSuccess, onError);
        }
    }

    private IEnumerator SendPostRequest<T>(string endpoint, string jsonBody, Action<T> onSuccess, Action<string> onError)
    {
        string fullUrl = baseUrl.TrimEnd('/') + endpoint;
        byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
        using (UnityWebRequest req = new UnityWebRequest(fullUrl, "POST"))
        {
            req.uploadHandler = new UploadHandlerRaw(bodyRaw);
            req.downloadHandler = new DownloadHandlerBuffer();
            req.SetRequestHeader("Content-Type", "application/json");
            req.timeout = 6;
            yield return req.SendWebRequest();
            HandleResponse(endpoint, req, onSuccess, onError);
        }
    }

    private void HandleResponse<T>(string endpoint, UnityWebRequest req, Action<T> onSuccess, Action<string> onError)
    {
        if (req.result == UnityWebRequest.Result.ConnectionError || req.result == UnityWebRequest.Result.ProtocolError)
        {
            isConnected = false;
            string err = $"Ошибка HTTP [{req.responseCode}] ({endpoint}): {req.error}";
            lastServerMessage = err;
            Debug.LogError($"[ServerBridge] {err}");
            onError?.Invoke(err);
            return;
        }

        string json = req.downloadHandler.text;
        try
        {
            T parsed = JsonUtility.FromJson<T>(json);
            isConnected = true;
            lastServerMessage = $"OK: {endpoint}";
            onSuccess?.Invoke(parsed);
        }
        catch (Exception ex)
        {
            string err = $"Ошибка JSON ({endpoint}): {ex.Message}";
            Debug.LogError($"[ServerBridge] {err} | {json}");
            onError?.Invoke(err);
        }
    }
}
