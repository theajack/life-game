/*
 * @Author: chenzhongsheng
 * @Date: 2024-11-02 20:40:22
 * @Description: Coding something
 */
// pub mod utils;
use once_cell::sync::Lazy;

use crate::shared::{send_log_data, send_log_id};
use wasm_bindgen::prelude::*;
// use crate::shared::set_shared_data;

// 初始化 SHARE_BUFFER
// ! 解引用 Lazy 类型的实例时，实际上是获取了对内部值的引用。这个操作是非常高效的，不会引入额外的性能开销
// static mut LIFE_MAP: Lazy<Vec<u8>> = Lazy::new(|| Vec::new());

pub static mut LIFE_MAP: Lazy<LifeMap> = Lazy::new(|| LifeMap::new());

// const PADDING: u8 = 4; // 四周填充0 为了方便get_around_cell_value计算

// 地图最大宽度为200 其余为padding padding是为了取周围细胞时避免if判断
const MAX_LEN: usize = 250 + 2; // 2 为padding
                                //

pub struct LifeMap {
    pub points: Vec<u8>,
    pub map: [[bool; MAX_LEN]; MAX_LEN],
    pub width: u8,  // 0-255 -> 1-256
    pub height: u8, // 0-255 -> 1-256
}

impl LifeMap {
    pub fn new() -> LifeMap {
        // let len = MAX_LEN as u8 - 1;
        LifeMap {
            points: Vec::new(),
            map: [[false; MAX_LEN]; MAX_LEN],
            width: 0,
            height: 0,
        }
    }

    // w,h: 0-255 -> 1-256, x,y都是从0开始
    // // ! [w, h, x1, y1, x2, y2, x3, y3, ...]
    // ! [x1, y1, x2, y2, x3, y3, ...]
    pub fn init_map(&mut self, data: Vec<u8>) {
        // send_log_id("debug-restart", &format!("n={}", self.points.len()));
        // self.width = buffer[0];
        // self.height = buffer[1];
        // self.width = MAX_LEN;
        // self.height = MAX_LEN;
        // let n = (self.width * self.height) as u16;
        // buffer.drain(0..2);
        self.width = data[0];
        self.height = data[1];
        // send_log_data(&format!("init_map {:?}", self.points));
    }

    pub fn init_cells(&mut self, cells: Vec<u8>) {
        self.points = cells;
        self.map = [[false; MAX_LEN]; MAX_LEN];
        let n = self.points.len() / 2;
        for i in 0..n {
            let s = i * 2;
            let x = self.points[s];
            let y = self.points[s + 1];
            self.set_cell_status(x, y, true);
        }
    }

    // 设置坐标位置的细胞状态
    fn set_cell_status(&mut self, x: u8, y: u8, alive: bool) {
        self.map[y as usize + 1][x as usize + 1] = alive;
    }

    pub fn turn_cell_status(&mut self, x: u8, y: u8) -> Vec<u8> {
        let alive = !self.get_cell_status(x, y);
        self.set_cell_status(x, y, alive);
        vec![x, y, if alive { 1 } else { 0 }]
    }

    pub fn receive_changes(&mut self, changes: Vec<u8>) {
        let n = changes.len() / 3;
        for i in 0..n {
            let s = 3 * i;
            self.set_cell_status(changes[s], changes[s + 1], changes[s + 2] == 1);
        }
    }

    // 获取坐标位置的状态
    fn get_cell_status(&self, x: u8, y: u8) -> bool {
        self.map[y as usize + 1][x as usize + 1]
    }
    // 获取实际值，不坐标偏移
    fn get_status(&self, x: u8, y: u8) -> bool {
        self.map[y as usize][x as usize]
    }
    // 获取周围8个细胞的状态
    fn get_around_alive_value(&self, ox: u8, oy: u8) -> u8 {
        let x = ox + 1;
        let y = oy + 1;
        let mut v: u8 = 0;

        if self.get_status(x - 1, y - 1) {
            v += 1;
        }
        if self.get_status(x, y - 1) {
            v += 1;
        }
        if self.get_status(x + 1, y - 1) {
            v += 1;
        }
        if self.get_status(x - 1, y) {
            v += 1;
        }
        if self.get_status(x + 1, y) {
            v += 1;
        }
        if self.get_status(x - 1, y + 1) {
            v += 1;
        }
        if self.get_status(x, y + 1) {
            v += 1;
        }
        if self.get_status(x + 1, y + 1) {
            v += 1;
        }
        v
    }

    pub fn step(&mut self) -> Vec<u8> {
        let mut mods: Vec<u8> = Vec::new();
        // send_log_data(&format!("step (h={},w={})", self.height, self.width));
        for y in 0..self.height {
            for x in 0..self.width {
                // 每个细胞有两种状态 - 存活或死亡，每个细胞与以自身为中心的周围八格细胞产生互动（如图，黑色为存活，白色为死亡）
                // 1. 当前细胞为存活状态时，当周围的存活细胞低于2个时（不包含2个），该细胞变成死亡状态。（模拟生命数量稀少）
                // 2. 当前细胞为存活状态时，当周围有2个或3个存活细胞时，该细胞保持原样。
                // 3. 当前细胞为存活状态时，当周围有超过3个存活细胞时，该细胞变成死亡状态。（模拟生命数量过多）
                // 4. 当前细胞为死亡状态时，当周围有3个存活细胞时，该细胞变成存活状态。（模拟繁殖）
                let alive_count = self.get_around_alive_value(x, y);
                let alive = self.get_cell_status(x, y);
                // send_log_data(&format!(
                //     "alive_count x={x};y={y};a={alive};n={alive_count};"
                // ));
                if alive {
                    if alive_count < 2 || alive_count > 3 {
                        // 1. 如果一个黑子只有1个或者没有黑子邻居，它在下一步就会死去，表示该黑子在社会里太孤单了。
                        // 3. 如果一个黑子有4个或者更多的黑子邻居，它在下一步也会死去，表示该黑子所在的社会环境太拥挤了。
                        // 孤单或拥挤死亡
                        mods.push(x);
                        mods.push(y);
                        mods.push(0);
                        // send_log_data(&format!(
                        //     "aliveChange x={x};y={y};a={alive};v={};n={alive_count};",
                        //     0
                        // ));
                    }
                } else {
                    if alive_count == 3 {
                        mods.push(x);
                        mods.push(y);
                        mods.push(1);
                        // send_log_data(&format!(
                        //     "aliveChange x={x};y={y};a={alive};v={};n={alive_count};",
                        //     1
                        // ));
                    }
                }
            }
        }
        // send_log_data(&format!("mods len={};{:?}", mods.len(), mods));

        let n = mods.len() / 3;
        for i in 0..n {
            let start = i * 3;
            self.set_cell_status(mods[start], mods[start + 1], mods[start + 2] == 1);
        }

        mods

        // self.gene_img_data();
    }

    // pub fn gene_img_data(&self) {
    //     for y in 0..self.height {
    //         for x in 0..self.width {
    //             let value: u8 = if self.get_cell_status(x, y) { 0 } else { 255 };

    //             let line_width = self.width as usize * 16; // 4个像素 + rgba
    //             let v_index: usize = line_width * 4 * y as usize + 16 * x as usize;

    //             set_shared_data(index, value)
    //         }
    //     }
    // }
}
