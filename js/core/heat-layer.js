/* =========================================================================
 * F14 事件热力图层
 *
 * 纯 Canvas 实现的事件密度可视化（无外部依赖）：
 *   - 把当前 atlas 所有事件（或符合 domainFilter 的）按坐标聚合
 *   - 每个事件画一个径向渐变圆，多个圆叠加形成热力效果
 *   - 颜色由低到高：透明蓝 → 青 → 黄 → 红
 *
 * 作为 Leaflet Layer 接入：setLatLngs(latlngs) + addTo(map)
 * ========================================================================= */

const DEFAULT = {
  radius: 35,        // 像素半径（屏幕坐标）
  blur: 0.85,        // 渐变衰减系数
  maxOpacity: 0.55,
  minOpacity: 0.10,
};

const GRADIENT = {
  0.0: 'rgba(33, 102, 172, 0)',
  0.2: 'rgba(33, 102, 172, 0.4)',
  0.4: 'rgba(103, 169, 207, 0.6)',
  0.6: 'rgba(255, 215, 96, 0.7)',
  0.8: 'rgba(252, 136, 82, 0.8)',
  1.0: 'rgba(189, 0, 38, 0.9)',
};

L.HeatLayer = L.Layer.extend({
  initialize(latlngs, options) {
    this._latlngs = latlngs || [];
    this._options = { ...DEFAULT, ...options };
  },

  setLatLngs(latlngs) {
    this._latlngs = latlngs || [];
    this._redraw();
    return this;
  },

  onAdd(map) {
    this._map = map;
    if (!this._canvas) {
      this._canvas = L.DomUtil.create('canvas', 'leaflet-heat-layer');
      const size = map.getSize();
      this._canvas.width = size.x;
      this._canvas.height = size.y;
      this._ctx = this._canvas.getContext('2d');
      map.getPanes().overlayPane.appendChild(this._canvas);
    }
    L.DomUtil.addClass(this._canvas, 'leaflet-layer');
    map.on('moveend zoomend resize viewreset', this._reset, this);
    this._reset();
  },

  onRemove(map) {
    if (this._canvas) {
      L.DomUtil.remove(this._canvas);
      this._canvas = null;
    }
    map.off('moveend zoomend resize viewreset', this._reset, this);
  },

  _reset() {
    if (!this._canvas) return;
    const size = this._map.getSize();
    this._canvas.width = size.x;
    this._canvas.height = size.y;
    const topLeft = this._map.containerPointToLayerPoint([0, 0]);
    L.DomUtil.setPosition(this._canvas, topLeft);
    this._redraw();
  },

  _redraw() {
    if (!this._canvas || !this._ctx) return;
    const ctx = this._ctx;
    const { radius, maxOpacity } = this._options;
    ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);

    // 把每个事件画到 canvas 上
    for (const ll of this._latlngs) {
      const p = this._map.latLngToContainerPoint([ll[0], ll[1]]);
      const x = p.x;
      const y = p.y;
      // 跳过视口外的
      if (x < -radius || y < -radius || x > this._canvas.width + radius || y > this._canvas.height + radius) continue;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      for (const [stop, color] of Object.entries(GRADIENT)) {
        grad.addColorStop(parseFloat(stop), color);
      }
      ctx.globalAlpha = maxOpacity;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  },
});

L.heatLayer = function (latlngs, options) {
  return new L.HeatLayer(latlngs, options);
};
