using UnityEngine;

/// <summary>
/// Модуль 1: Законы Мира с телефона учителя!
/// Вешается на любой Cube / Player. Сам подтягивает скорость, размер, цвет и гравитацию с сервера.
/// </summary>
public class ServerCubeBoost : MonoBehaviour
{
    public float baseSpinSpeed = 45f;
    public bool autoSyncEvery3Seconds = true;

    private float currentMultiplier = 2f;
    private Vector3 targetScale = Vector3.one;
    private float syncTimer = 0f;

    private void Start() => SyncWorld();

    private void Update()
    {
        transform.Rotate(Vector3.up, baseSpinSpeed * currentMultiplier * Time.deltaTime);
        transform.localScale = Vector3.Lerp(transform.localScale, targetScale, Time.deltaTime * 6f);

        if (Input.GetKeyDown(KeyCode.R))
        {
            SyncWorld();
        }

        if (autoSyncEvery3Seconds)
        {
            syncTimer += Time.deltaTime;
            if (syncTimer >= 3f)
            {
                syncTimer = 0f;
                SyncWorld();
            }
        }
    }

    public void SyncWorld()
    {
        ServerBridge.Instance.GetWorldState((world) =>
        {
            currentMultiplier = world.expMultiplier;
            float s = Mathf.Clamp(world.cubeScale, 0.3f, 4f);
            targetScale = new Vector3(s, s, s);
            Physics.gravity = new Vector3(0f, world.gravityY, 0f);

            Color parsedColor = Color.yellow;
            if (!string.IsNullOrEmpty(world.cubeColorHex))
            {
                ColorUtility.TryParseHtmlString(world.cubeColorHex, out parsedColor);
            }

            var rend3D = GetComponentInChildren<Renderer>();
            if (rend3D != null) rend3D.material.color = parsedColor;

            var rend2D = GetComponentInChildren<SpriteRenderer>();
            if (rend2D != null) rend2D.color = parsedColor;
        });
    }
}
