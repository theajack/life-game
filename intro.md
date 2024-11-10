<!--
 * @Author: chenzhongsheng
 * @Date: 2024-11-10 11:49:12
 * @Description: Coding something
-->
# 生命游戏

[Visit](https://theajack.github.io/life-game) | [Demo Code](https://github.com/theajack/life-game/blob/main/app/index.ts) | [Github](https://github.com/theajack/life-game)

生命游戏，又称为康威生命游戏，是英国数学家约翰・何顿・康威在 1970 年发明的一种细胞自动机。

生命游戏在一个二维网格世界中进行。这个网格中的每个格子都代表一个细胞，每个细胞都有两种可能的状态：存活或死亡。

游戏的演化遵循以下规则：

1. 生存：如果一个活细胞周围有两个或三个活细胞，它将继续存活到下一代。
2. 死亡：如果一个活细胞周围的活细胞少于两个，它将因孤独而死亡；如果周围的活细胞多于三个，它将因过度拥挤而死亡。
3. 诞生：如果一个死细胞周围正好有三个活细胞，它将在下一代变为活细胞。

生命游戏具有很多有趣的特性。它可以产生各种各样复杂的图案和动态变化，有时看似随机，有时又会出现稳定的结构。它引发了人们对复杂性、自组织和涌现现象的深入思考，在数学、计算机科学、生物学等领域都有一定的研究价值。

## 极致性能优化

1. 使用 Web Worker 和 SharedArrayBuffer 共享缓冲区。
2. 使用 Rust 和 WebAssembly 计算细胞状态。
3. 在 Rust 和 JavaScript 之间共享内存以避免内存拷贝带来的性能损耗
4. 填充边界以避免过多的 if 判断