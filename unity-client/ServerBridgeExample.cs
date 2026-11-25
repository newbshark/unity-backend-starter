using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Пример использования ServerBridge в реальной игре Unity.
/// Повесьте этот скрипт на любой GameObject (например, GameManager или HUD).
/// </summary>
public class ServerBridgeExample : MonoBehaviour
{
    [Header("Ссылки на UI (необязательно)")]
    public Text statusLabel;
    public Text motdLabel;

    private void Start()
    {
        Debug.Log("[GameManager] Запрос данных с сервера NestJS...");
        RequestServerData();
    }

    public void RequestServerData()
    {
        // 1. Проверяем статус сервера
        ServerBridge.Instance.GetServerStatus((statusData) =>
        {
            string log = $"Сервер в сети: {statusData.status.ToUpper()} | Аптайм: {statusData.uptimeSeconds} сек | Игроков: {statusData.activePlayers}";
            Debug.Log($"<color=#22c55e>[БЭКЕНД УСПЕХ]</color> {log}");

            if (statusLabel != null)
                statusLabel.text = $"ONLINE • {statusData.uptimeSeconds}s";
        },
        (error) =>
        {
            Debug.LogError($"<color=#ef4444>[БЭКЕНД ОШИБКА]</color> Сервер не ответил: {error}");
            if (statusLabel != null)
                statusLabel.text = "OFFLINE (Запустите 'npm run start:dev')";
        });

        // 2. Получаем сообщение дня (MOTD)
        ServerBridge.Instance.GetMotd((motdData) =>
        {
            string log = $"{motdData.title}: {motdData.motd} (Множитель опыта: x{motdData.expMultiplier})";
            Debug.Log($"<color=#3b82f6>[MOTD]</color> {log}");

            if (motdLabel != null)
                motdLabel.text = $"{motdData.title}
{motdData.motd}";
        });
    }
}
