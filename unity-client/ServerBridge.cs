using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

/// <summary>
/// Единый мост подключения Unity к бэкенду на NestJS.
/// Работает без сторонних библиотек через нативный UnityWebRequest.
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

    [Header("Настройки подключения")]
    [Tooltip("Облачный сервер курса (или http://localhost:3000 для локального запуска)")]
    public string baseUrl = "https://vox-auspex-citadel-production.up.railway.app";

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

    #region DTO Структуры данных (Соответствуют DTO сервера на NestJS)

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

    #endregion

    #region Публичные методы API

    /// <summary>
    /// Запрашивает статус сервера и пинг.
    /// </summary>
    public void GetServerStatus(Action<ServerStatusResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest<ServerStatusResponse>("/server/status", onSuccess, onError));
    }

    /// <summary>
    /// Запрашивает Сообщение Дня (MOTD).
    /// </summary>
    public void GetMotd(Action<MotdResponse> onSuccess, Action<string> onError = null)
    {
        StartCoroutine(SendGetRequest<MotdResponse>("/server/motd", onSuccess, onError));
    }

    #endregion

    #region Базовые корутины Web-запросов

    private IEnumerator SendGetRequest<T>(string endpoint, Action<T> onSuccess, Action<string> onError)
    {
        string fullUrl = baseUrl.TrimEnd('/') + endpoint;
        using (UnityWebRequest webRequest = UnityWebRequest.Get(fullUrl))
        {
            webRequest.timeout = 5; // Таймаут 5 секунд
            yield return webRequest.SendWebRequest();

            if (webRequest.result == UnityWebRequest.Result.ConnectionError ||
                webRequest.result == UnityWebRequest.Result.ProtocolError)
            {
                string errorMsg = $"Ошибка HTTP [{webRequest.responseCode}] при запросе к {endpoint}: {webRequest.error}";
                Debug.LogError($"[ServerBridge] {errorMsg}");
                onError?.Invoke(errorMsg);
            }
            else
            {
                string jsonResponse = webRequest.downloadHandler.text;
                try
                {
                    T parsedData = JsonUtility.FromJson<T>(jsonResponse);
                    onSuccess?.Invoke(parsedData);
                }
                catch (Exception ex)
                {
                    string parseError = $"Ошибка парсинга JSON ответа: {ex.Message}\nСырой JSON: {jsonResponse}";
                    Debug.LogError($"[ServerBridge] {parseError}");
                    onError?.Invoke(parseError);
                }
            }
        }
    }

    #endregion
}
